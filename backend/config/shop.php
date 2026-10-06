<?php

return [
    'order_number_prefix' => env('ORDER_NUMBER_PREFIX', 'SKN'),
    'order_number_start' => 10000,
    'currency' => env('SHOP_CURRENCY', 'TZS'),

    // Defaults used until an admin saves values on the Settings page.
    'defaults' => [
        'store_name' => 'Medicube',
        'store_email' => 'hello@example.com',
        'store_phone' => '+255 700 000 000',
        'store_address' => 'Masaki, Dar es Salaam, Tanzania',
        'delivery_fee_default' => 10000,
        'delivery_fees_by_region' => [
            'Dar es Salaam' => 5000,
            'Pwani' => 8000,
        ],
        'free_delivery_threshold' => 200000,
        'low_stock_threshold' => 5,
    ],

    'regions' => [
        'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma',
        'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza',
        'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga',
        'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South',
        'Mjini Magharibi',
    ],
];
