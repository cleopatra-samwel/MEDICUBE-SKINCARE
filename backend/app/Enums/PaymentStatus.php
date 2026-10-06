<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'PENDING';
    case Processing = 'PROCESSING';
    case Paid = 'PAID';
    case Failed = 'FAILED';
    case Cancelled = 'CANCELLED';
    case Refunded = 'REFUNDED';

    public function isFinal(): bool
    {
        return in_array($this, [self::Paid, self::Failed, self::Cancelled, self::Refunded], true);
    }

    /** @return string[] */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
