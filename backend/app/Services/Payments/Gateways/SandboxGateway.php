<?php

namespace App\Services\Payments\Gateways;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\Payments\GatewayCallback;
use App\Services\Payments\GatewayInitResult;
use App\Services\Payments\PaymentGateway;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Local-development gateway. It never moves money and never reports success on
 * its own: an order becomes PAID only when a callback signed with
 * PAYMENT_SANDBOX_SECRET arrives, exactly like a real provider.
 * Send one with: php artisan payments:simulate {reference} paid
 */
class SandboxGateway implements PaymentGateway
{
    public function __construct(private readonly array $config) {}

    public function initiate(Payment $payment): GatewayInitResult
    {
        if (app()->isProduction()) {
            throw new RuntimeException('The sandbox payment gateway is disabled in production.');
        }

        return new GatewayInitResult(
            status: PaymentStatus::Processing,
            providerReference: 'SBX-'.strtoupper(bin2hex(random_bytes(4))),
            customerMessage: 'Sandbox mode: no money is collected. A developer confirms this payment with "php artisan payments:simulate '.$payment->reference.' paid".',
            meta: ['sandbox' => true],
        );
    }

    public function parseCallback(Request $request): GatewayCallback
    {
        $secret = (string) ($this->config['webhook_secret'] ?? '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        $valid = $secret !== '' && hash_equals($expected, (string) $request->header('X-Sandbox-Signature'));

        $status = match (strtolower((string) $request->input('status'))) {
            'paid', 'success' => PaymentStatus::Paid,
            'failed' => PaymentStatus::Failed,
            'cancelled' => PaymentStatus::Cancelled,
            default => null,
        };

        return new GatewayCallback(
            signatureValid: $valid,
            reference: $request->input('reference'),
            status: $status,
            providerReference: $request->input('provider_reference'),
            amount: $request->filled('amount') ? (int) $request->input('amount') : null,
            failureReason: $request->input('reason'),
        );
    }

    public function queryStatus(Payment $payment): ?PaymentStatus
    {
        return null; // Nothing to query; status arrives only via signed callbacks.
    }

    public function refund(Payment $payment, ?string $reason = null): bool
    {
        return ! app()->isProduction();
    }
}
