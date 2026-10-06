<?php

namespace App\Services\Payments\Gateways;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\Payments\GatewayCallback;
use App\Services\Payments\GatewayInitResult;
use App\Services\Payments\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * TEMPLATE for a real provider (a Tanzanian aggregator that supports mobile
 * money, cards and bank). Endpoint paths, field names, the signature scheme and
 * status values below are placeholders: replace each one with the values in your
 * chosen provider's API documentation, then set PAYMENT_DEFAULT_GATEWAY=provider.
 */
class HttpProviderGateway implements PaymentGateway
{
    public function __construct(private readonly array $config)
    {
        if (empty($config['base_url'])) {
            throw new RuntimeException('Set PAYMENT_PROVIDER_BASE_URL and credentials before enabling the provider gateway.');
        }
    }

    public function initiate(Payment $payment): GatewayInitResult
    {
        $order = $payment->order;

        // TODO(provider): adjust path and payload to the provider's "create checkout / push USSD" API.
        $response = Http::withToken($this->accessToken())
            ->acceptJson()
            ->timeout(20)
            ->post($this->url('/checkout'), [
                'reference' => $payment->reference,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'method' => $payment->method,
                'phone' => $payment->payer_phone,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'callback_url' => url('/api/v1/payments/webhook/provider'),
                'redirect_url' => rtrim(explode(',', (string) env('FRONTEND_URL'))[0], '/').'/checkout/payment/'.$order->order_number,
            ])
            ->throw()
            ->json();

        return new GatewayInitResult(
            status: PaymentStatus::Processing,
            providerReference: $response['transaction_id'] ?? null,     // TODO(provider)
            checkoutUrl: $response['checkout_url'] ?? null,             // TODO(provider)
            customerMessage: $payment->method === 'mobile_money' ? 'Check your phone and enter your PIN to approve the payment.' : null,
            meta: ['provider_response' => $response],
        );
    }

    public function parseCallback(Request $request): GatewayCallback
    {
        // TODO(provider): use the provider's documented signature header and algorithm.
        $secret = (string) ($this->config['webhook_secret'] ?? '');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        $valid = $secret !== '' && hash_equals($expected, (string) $request->header('X-Signature'));

        return new GatewayCallback(
            signatureValid: $valid,
            reference: $request->input('reference'),
            status: $this->mapStatus((string) $request->input('status')),
            providerReference: $request->input('transaction_id'),
            amount: $request->filled('amount') ? (int) $request->input('amount') : null,
            failureReason: $request->input('message'),
        );
    }

    public function queryStatus(Payment $payment): ?PaymentStatus
    {
        // TODO(provider): adjust to the provider's "transaction status" endpoint.
        $response = Http::withToken($this->accessToken())
            ->acceptJson()
            ->get($this->url('/transactions/'.urlencode($payment->reference)))
            ->throw()
            ->json();

        return $this->mapStatus((string) ($response['status'] ?? ''));
    }

    public function refund(Payment $payment, ?string $reason = null): bool
    {
        // TODO(provider): many mobile-money providers do not support API refunds;
        // return false to force a manual refund process in that case.
        $response = Http::withToken($this->accessToken())
            ->acceptJson()
            ->post($this->url('/refunds'), [
                'transaction_id' => $payment->provider_reference,
                'amount' => $payment->amount,
                'reason' => $reason,
            ]);

        return $response->successful();
    }

    private function mapStatus(string $status): ?PaymentStatus
    {
        // TODO(provider): map the provider's status vocabulary.
        return match (strtoupper($status)) {
            'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'PAID' => PaymentStatus::Paid,
            'FAILED', 'DECLINED', 'EXPIRED' => PaymentStatus::Failed,
            'CANCELLED', 'CANCELED' => PaymentStatus::Cancelled,
            'PENDING', 'PROCESSING' => PaymentStatus::Processing,
            'REFUNDED' => PaymentStatus::Refunded,
            default => null,
        };
    }

    private function accessToken(): string
    {
        // TODO(provider): adjust to the provider's authentication flow.
        return Cache::remember('payments.provider.token', now()->addMinutes(50), function () {
            return Http::acceptJson()
                ->post($this->url('/auth/token'), [
                    'client_id' => $this->config['client_id'],
                    'client_secret' => $this->config['client_secret'],
                ])
                ->throw()
                ->json('access_token');
        });
    }

    private function url(string $path): string
    {
        return rtrim($this->config['base_url'], '/').$path;
    }
}
