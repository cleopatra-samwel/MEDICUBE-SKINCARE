<?php

namespace App\Services\Payments;

use App\Enums\PaymentStatus;

final class GatewayCallback
{
    public function __construct(
        public readonly bool $signatureValid,
        public readonly ?string $reference,          // our payments.reference
        public readonly ?PaymentStatus $status,
        public readonly ?string $providerReference = null,
        public readonly ?int $amount = null,
        public readonly ?string $failureReason = null,
    ) {}
}
