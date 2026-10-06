<?php

return [
    'default' => env('PAYMENT_DEFAULT_GATEWAY', 'sandbox'),

    // Methods shown to customers at checkout. Each maps to a gateway key.
    'methods' => [
        'mobile_money' => ['label' => 'Mobile money', 'description' => 'M-Pesa, Tigo Pesa (Mixx), Airtel Money, HaloPesa', 'gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'sandbox'), 'enabled' => true],
        'card' => ['label' => 'Card', 'description' => 'Visa or Mastercard', 'gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'sandbox'), 'enabled' => true],
        'bank' => ['label' => 'Bank transfer', 'description' => 'Pay from your bank account', 'gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'sandbox'), 'enabled' => true],
    ],

    'gateways' => [
        'sandbox' => [
            'driver' => App\Services\Payments\Gateways\SandboxGateway::class,
            'webhook_secret' => env('PAYMENT_SANDBOX_SECRET'),
        ],
        // Template for a real provider (e.g. a Tanzanian aggregator).
        'provider' => [
            'driver' => App\Services\Payments\Gateways\HttpProviderGateway::class,
            'base_url' => env('PAYMENT_PROVIDER_BASE_URL'),
            'client_id' => env('PAYMENT_PROVIDER_CLIENT_ID'),
            'client_secret' => env('PAYMENT_PROVIDER_CLIENT_SECRET'),
            'webhook_secret' => env('PAYMENT_PROVIDER_WEBHOOK_SECRET'),
        ],
    ],
];
