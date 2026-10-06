<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Customer',
            self::Admin => 'Admin',
            self::SuperAdmin => 'Super admin',
        };
    }

    public function isStaff(): bool
    {
        return $this !== self::Customer;
    }

    /** @return string[] */
    public static function staffValues(): array
    {
        return [self::Admin->value, self::SuperAdmin->value];
    }
}
