<?php

use Illuminate\Support\Facades\Route;

// This project is API-only; the storefront is the React app in /frontend.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api/v1'),
]));
