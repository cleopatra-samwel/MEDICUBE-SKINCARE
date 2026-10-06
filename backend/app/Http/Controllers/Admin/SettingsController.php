<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'settings' => $this->settings->all(),
            'regions' => config('shop.regions'),
            'can_edit' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        Gate::authorize('manage-settings');

        $data = $request->validate([
            'store_name' => ['required', 'string', 'max:100'],
            'store_email' => ['required', 'email'],
            'store_phone' => ['required', 'string', 'max:30'],
            'store_address' => ['required', 'string', 'max:255'],
            'delivery_fee_default' => ['required', 'integer', 'min:0'],
            'delivery_fees_by_region' => ['nullable', 'array'],
            'delivery_fees_by_region.*' => ['integer', 'min:0'],
            'free_delivery_threshold' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
        ]);

        foreach (array_keys($data['delivery_fees_by_region'] ?? []) as $region) {
            validator(['region' => $region], ['region' => [Rule::in(config('shop.regions'))]])->validate();
        }

        return response()->json(['settings' => $this->settings->update($data), 'message' => 'Settings saved.']);
    }
}
