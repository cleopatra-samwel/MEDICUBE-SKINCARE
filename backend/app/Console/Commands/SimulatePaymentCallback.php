<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\Payments\PaymentService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

/**
 * Development helper: sends a signed sandbox callback through the SAME
 * verification path a real provider webhook uses.
 */
class SimulatePaymentCallback extends Command
{
    protected $signature = 'payments:simulate {reference : Payment reference, e.g. PAY-SKN-10001-AB12CD} {status=paid : paid|failed|cancelled}';

    protected $description = 'Send a signed sandbox payment callback (local development only).';

    public function handle(PaymentService $payments): int
    {
        if (app()->isProduction()) {
            $this->error('Not available in production.');

            return self::FAILURE;
        }

        $payment = Payment::query()->where('reference', $this->argument('reference'))->first();
        if (! $payment) {
            $this->error('No payment with that reference. Find it on the admin Payments page.');

            return self::FAILURE;
        }

        $body = json_encode([
            'reference' => $payment->reference,
            'status' => $this->argument('status'),
            'amount' => $payment->amount,
            'provider_reference' => $payment->provider_reference,
        ]);
        $signature = hash_hmac('sha256', $body, (string) config('payments.gateways.sandbox.webhook_secret'));

        $request = Request::create('/api/v1/payments/webhook/sandbox', 'POST', server: [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_SANDBOX_SIGNATURE' => $signature,
        ], content: $body);

        $result = $payments->handleCallback('sandbox', $request);
        $payment->refresh();

        $this->info("Callback result: {$result}. Payment {$payment->reference} is now {$payment->status->value}.");

        return $result === 'ok' ? self::SUCCESS : self::FAILURE;
    }
}
