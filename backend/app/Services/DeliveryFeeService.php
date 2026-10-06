<?php

namespace App\Services;

class DeliveryFeeService
{
    public function __construct(private readonly SettingsService $settings) {}

    public function forRegion(?string $region, int $subtotal): int
    {
        $threshold = (int) $this->settings->get('free_delivery_threshold', 0);
        if ($threshold > 0 && $subtotal >= $threshold) {
            return 0;
        }

        $byRegion = (array) $this->settings->get('delivery_fees_by_region', []);
        if ($region && array_key_exists($region, $byRegion)) {
            return (int) $byRegion[$region];
        }

        return (int) $this->settings->get('delivery_fee_default', 0);
    }
}
