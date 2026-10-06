<?php

namespace App\Services\Payments;

use App\Enums\PaymentStatus;

final class GatewayInitResult
{
    public function __construct(
        public readonly PaymentStatus $status,           // PENDING or PROCESSING, never PAID
        public readonly ?string $providerReference = null,
        public readonly ?string $checkoutUrl = null,     // redirect-style gateways (cards)
        public readonly ?string $customerMessage = null, // e.g. "Check your phone to approve"
        public readonly array $meta = [],
    ) {}
}
