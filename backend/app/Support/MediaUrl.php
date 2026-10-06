<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUrl
{
    /**
     * Uploaded files live on the "public" disk (storage path, e.g. "products/abc.jpg").
     * Seeded demo images are frontend assets ("/images/products/x.svg") and absolute
     * URLs (a CDN) are passed through untouched.
     */
    public static function for(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        if (Str::startsWith($path, ['http://', 'https://', '/'])) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
