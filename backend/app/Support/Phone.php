<?php

namespace App\Support;

class Phone
{
    /** Accepts 07XXXXXXXX, 06XXXXXXXX, +2557XXXXXXXX, 2557XXXXXXXX (spaces allowed). */
    public const TZ_REGEX = '/^(?:\+?255|0)[67]\d{8}$/';

    public static function clean(string $phone): string
    {
        return preg_replace('/[\s\-()]/', '', $phone) ?? $phone;
    }

    /** Normalise to 2557XXXXXXXX so "0712..." and "+255712..." match each other. */
    public static function normalize(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?? '';
        if (str_starts_with($digits, '0')) {
            return '255'.substr($digits, 1);
        }

        return $digits;
    }
}
