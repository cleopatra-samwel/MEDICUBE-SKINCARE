<?php

namespace App\Enums;

enum ProductStatus: string
{
    case Active = 'ACTIVE';
    case Inactive = 'INACTIVE';
    case OutOfStock = 'OUT_OF_STOCK';

    /** @return string[] */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
