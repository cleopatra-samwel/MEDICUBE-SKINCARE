<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case Pending = 'PENDING';
    case ReadyForDelivery = 'READY_FOR_DELIVERY';
    case OutForDelivery = 'OUT_FOR_DELIVERY';
    case Delivered = 'DELIVERED';
    case Failed = 'FAILED';

    /** The order status a delivery update moves the order to, if any. */
    public function orderStatus(): ?OrderStatus
    {
        return match ($this) {
            self::ReadyForDelivery => OrderStatus::ReadyForDelivery,
            self::OutForDelivery => OrderStatus::OutForDelivery,
            self::Delivered => OrderStatus::Delivered,
            default => null,
        };
    }

    /** @return string[] */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
