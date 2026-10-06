<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'shop.settings';

    /** @return array<string, mixed> */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $stored = Setting::query()->pluck('value', 'key')->all();

            return array_merge(config('shop.defaults'), $stored);
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    /** @param array<string, mixed> $values */
    public function update(array $values): array
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
        Cache::forget(self::CACHE_KEY);

        return $this->all();
    }
}
