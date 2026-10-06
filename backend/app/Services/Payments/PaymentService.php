<?php

namespace App\Services\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentCallback;
use App\Support\Phone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(private readonly PaymentGatewayManager $gateways) {}

    public function initiate(Order $order, string $method, ?string $payerPhone = null): Payment
    {
        if ($order->isPaid()) {
            throw ValidationException::withMessages(['order' => ['This order has already been paid.']]);
        }
        if ($order->status === OrderStatus::Cancelled) {
            throw ValidationException::withMessages(['order' => ['This order was cancelled and cannot be paid.']]);
        }

        $gatewayName = $this->gateways->gatewayForMethod($method);

        $payment = DB::transaction(function () use ($order, $method, $payerPhone, $gatewayName) {
            // Only one live attempt per order: close earlier unfinished attempts.
            $order->payments()
                ->whereIn('status', [PaymentStatus::Pending->value, PaymentStatus::Processing->value])
                ->update(['status' => PaymentStatus::Cancelled->value, 'failure_reason' => 'Superseded by a new attempt']);

            return $order->payments()->create([
                'reference' => 'PAY-'.$order->order_number.'-'.Str::upper(Str::random(6)),
                'gateway' => $gatewayName,
                'method' => $method,
                'amount' => $order->total,       // always the server-side total
                'currency' => $order->currency,
                'status' => PaymentStatus::Pending,
                'payer_phone' => $payerPhone ? Phone::normalize($payerPhone) : null,
            ]);
        });

        $payment->setRelation('order', $order);

        try {
            $result = $this->gateways->gateway($gatewayName)->initiate($payment);
        } catch (\Throwable $e) {
            Log::error('Payment initiation failed', ['payment' => $payment->reference, 'error' => $e->getMessage()]);
            $payment->update(['status' => PaymentStatus::Failed, 'failure_reason' => 'Could not reach the payment provider.']);
            $order->update(['payment_status' => PaymentStatus::Failed]);
            throw ValidationException::withMessages(['payment' => ['We could not start the payment. Please try again in a moment.']]);
        }

        // A gateway may never report PAID at initiation; only a verified callback or query can.
        $status = $result->status === PaymentStatus::Paid ? PaymentStatus::Processing : $result->status;

        $payment->update([
            'status' => $status,
            'provider_reference' => $result->providerReference,
            'checkout_url' => $result->checkoutUrl,
            'meta' => array_merge($result->meta, ['customer_message' => $result->customerMessage]),
        ]);
        $order->update(['payment_status' => $status]);

        return $payment->fresh();
    }

    /** Entry point for provider webhooks. Returns a short result code for logging. */
    public function handleCallback(string $gatewayName, Request $request): string
    {
        $log = PaymentCallback::create([
            'gateway' => $gatewayName,
            'payload' => $request->all(),
            'signature_valid' => false,
        ]);

        $callback = $this->gateways->gateway($gatewayName)->parseCallback($request);
        $log->signature_valid = $callback->signatureValid;

        $result = $this->processCallback($gatewayName, $callback, $log);
        $log->result = $result;
        $log->processed_at = now();
        $log->save();

        return $result;
    }

    private function processCallback(string $gatewayName, GatewayCallback $callback, PaymentCallback $log): string
    {
        if (! $callback->signatureValid) {
            Log::warning('Rejected payment callback with invalid signature', ['gateway' => $gatewayName]);

            return 'invalid_signature';
        }

        $payment = Payment::query()->where('reference', $callback->reference)->where('gateway', $gatewayName)->first();
        if (! $payment || ! $callback->status) {
            return 'unknown_payment';
        }
        $log->payment_id = $payment->id;

        if ($callback->amount !== null && $callback->amount !== $payment->amount) {
            Log::alert('Payment amount mismatch', ['payment' => $payment->reference, 'expected' => $payment->amount, 'received' => $callback->amount]);
            $this->applyStatus($payment, PaymentStatus::Failed, $callback->providerReference, 'Amount mismatch');

            return 'amount_mismatch';
        }

        $this->applyStatus($payment, $callback->status, $callback->providerReference, $callback->failureReason);

        return 'ok';
    }

    /** Admin action: ask the provider for the latest status. */
    public function verify(Payment $payment): Payment
    {
        $status = $this->gateways->gateway($payment->gateway)->queryStatus($payment);
        if ($status) {
            $this->applyStatus($payment, $status);
        }

        return $payment->fresh();
    }

    public function refund(Payment $payment, ?string $reason = null): Payment
    {
        if ($payment->status !== PaymentStatus::Paid) {
            throw ValidationException::withMessages(['payment' => ['Only paid payments can be refunded.']]);
        }
        if (! $this->gateways->gateway($payment->gateway)->refund($payment, $reason)) {
            throw ValidationException::withMessages(['payment' => ['The payment provider did not accept the refund.']]);
        }
        $this->applyStatus($payment, PaymentStatus::Refunded, null, $reason);

        return $payment->fresh();
    }

    public function applyStatus(Payment $payment, PaymentStatus $status, ?string $providerReference = null, ?string $reason = null): void
    {
        DB::transaction(function () use ($payment, $status, $providerReference, $reason) {
            /** @var Payment $locked */
            $locked = Payment::query()->lockForUpdate()->findOrFail($payment->id);

            // Idempotent: repeated callbacks for a settled payment change nothing,
            // except a PAID payment that is later refunded.
            if ($locked->status->isFinal() && ! ($locked->status === PaymentStatus::Paid && $status === PaymentStatus::Refunded)) {
                return;
            }

            $locked->status = $status;
            $locked->provider_reference = $providerReference ?? $locked->provider_reference;
            $locked->failure_reason = in_array($status, [PaymentStatus::Failed, PaymentStatus::Cancelled, PaymentStatus::Refunded], true) ? $reason : null;
            if ($status === PaymentStatus::Paid) {
                $locked->paid_at = now();
            }
            if ($status === PaymentStatus::Refunded) {
                $locked->refunded_at = now();
            }
            $locked->save();

            $order = $locked->order()->lockForUpdate()->first();
            $order->payment_status = $status;
            if ($status === PaymentStatus::Paid) {
                $order->paid_at = now();
            }
            $order->save();

            if ($status === PaymentStatus::Paid) {
                $order->statusHistory()->create(['to_status' => $order->status->value, 'note' => 'Payment confirmed ('.$locked->reference.')']);
            }
        });
    }
}
