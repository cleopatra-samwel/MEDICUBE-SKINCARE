<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'PENDING';
    case Confirmed = 'CONFIRMED';
    case Processing = 'PROCESSING';
    case ReadyForDelivery = 'READY_FOR_DELIVERY';
    case OutForDelivery = 'OUT_FOR_DELIVERY';
    case Delivered = 'DELIVERED';
    case Cancelled = 'CANCELLED';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Order placed',
            self::Confirmed => 'Confirmed',
            self::Processing => 'Processing',
            self::ReadyForDelivery => 'Ready for delivery',
            self::OutForDelivery => 'Out for delivery',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * The fulfilment pipeline. Admins move orders forward one step at a time;
     * cancelling is allowed until the parcel leaves the store.
     *
     * @return self[]
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::Processing, self::Cancelled],
            self::Processing => [self::ReadyForDelivery, self::Cancelled],
            self::ReadyForDelivery => [self::OutForDelivery, self::Cancelled],
            self::OutForDelivery => [self::Delivered],
            self::Delivered, self::Cancelled => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }

    /** Ordered steps shown on the tracking timeline. @return self[] */
    public static function pipeline(): array
    {
        return [self::Pending, self::Confirmed, self::Processing, self::ReadyForDelivery, self::OutForDelivery, self::Delivered];
    }

    /** @return string[] */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
