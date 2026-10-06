<?php

namespace App\Services\Payments;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Contract every payment provider driver implements. Add a provider by writing
 * a class that implements this interface and registering it in config/payments.php.
 */
interface PaymentGateway
{
    /** Ask the provider to start collecting money (USSD push, card page, bank instructions...). */
    public function initiate(Payment $payment): GatewayInitResult;

    /**
     * Turn an incoming provider callback into a normalised result.
     * MUST verify the provider's signature; unsigned callbacks are never trusted.
     */
    public function parseCallback(Request $request): GatewayCallback;

    /** Ask the provider for the current status, or null if it cannot be queried. */
    public function queryStatus(Payment $payment): ?PaymentStatus;

    /** Request a refund. Return true only when the provider accepted it. */
    public function refund(Payment $payment, ?string $reason = null): bool;
}
