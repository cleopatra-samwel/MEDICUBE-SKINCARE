<?php

use App\Http\Controllers\Account\AddressController;
use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Account\WishlistController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TrackingController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1  (all routes are prefixed with /api/v1)
|--------------------------------------------------------------------------
| 1. Public storefront      — no sign-in needed (guests can shop and pay)
| 2. Auth                   — customer + admin sign-in
| 3. Customer account       — auth:sanctum
| 4. Admin                  — auth:sanctum + role:admin,super_admin (checked on
|                             every request against the database)
*/

Route::prefix('v1')->middleware('throttle:api')->group(function () {

    // ---- 1. Public storefront ------------------------------------------------
    Route::get('shop/config', [CatalogController::class, 'config']);
    Route::get('categories', [CatalogController::class, 'categories']);
    Route::get('products', [CatalogController::class, 'products']);
    Route::get('products/{key}', [CatalogController::class, 'product']);
    Route::get('products/{key}/related', [CatalogController::class, 'related']);
    Route::get('products/{product}/reviews', [ReviewController::class, 'index']);
    Route::post('products/{product}/reviews', [ReviewController::class, 'store'])->middleware('throttle:forms');
    Route::get('reviews/featured', [ReviewController::class, 'featured']);

    Route::post('cart/quote', [CartController::class, 'quote']);
    Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout');
    Route::post('orders/{order}/payments', [PaymentController::class, 'initiate'])->middleware('throttle:checkout');
    Route::get('orders/{order}/payment-status', [PaymentController::class, 'status'])->middleware('throttle:tracking');
    Route::post('track-order', TrackingController::class)->middleware('throttle:tracking');

    // Provider callbacks: unauthenticated, verified by signature inside the gateway.
    Route::post('payments/webhook/{gateway}', [PaymentController::class, 'webhook'])->withoutMiddleware('throttle:api');

    Route::post('newsletter', [EngagementController::class, 'subscribe'])->middleware('throttle:forms');
    Route::post('contact', [EngagementController::class, 'contact'])->middleware('throttle:forms');

    // ---- 2. Auth -------------------------------------------------------------
    Route::middleware('throttle:auth')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::post('auth/login', [AuthController::class, 'login']);
        Route::post('admin/auth/login', [AuthController::class, 'adminLogin']);
    });

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // ---- 3. Customer account -------------------------------------------
        Route::prefix('account')->group(function () {
            Route::put('profile', [ProfileController::class, 'update']);
            Route::put('password', [ProfileController::class, 'changePassword']);
            Route::apiResource('addresses', AddressController::class)->except('show');
            Route::get('orders', [AccountOrderController::class, 'index']);
            Route::get('orders/{order}', [AccountOrderController::class, 'show']);
            Route::get('wishlist', [WishlistController::class, 'index']);
            Route::post('wishlist', [WishlistController::class, 'store']);
            Route::delete('wishlist/{productId}', [WishlistController::class, 'destroy'])->whereNumber('productId');
            Route::get('cart', [CartController::class, 'show']);
            Route::put('cart', [CartController::class, 'sync']);
        });

        // ---- 4. Admin (backend-enforced role check) ---------------------------
        Route::prefix('admin')->middleware('role:admin,super_admin')->group(function () {
            Route::get('dashboard', Admin\DashboardController::class);
            Route::get('analytics', Admin\AnalyticsController::class);

            Route::apiResource('products', Admin\ProductController::class);
            Route::patch('products/{product}/status', [Admin\ProductController::class, 'updateStatus']);
            Route::post('products/{product}/images', [Admin\ProductController::class, 'uploadImages']);
            Route::patch('products/{product}/images/{image}/primary', [Admin\ProductController::class, 'setPrimaryImage']);
            Route::delete('products/{product}/images/{image}', [Admin\ProductController::class, 'deleteImage']);

            Route::apiResource('categories', Admin\CategoryController::class)->except('show');
            Route::post('categories/{category}/image', [Admin\CategoryController::class, 'uploadImage']);

            Route::get('orders', [Admin\OrderController::class, 'index']);
            Route::get('orders/{order}', [Admin\OrderController::class, 'show']);
            Route::patch('orders/{order}/status', [Admin\OrderController::class, 'updateStatus']);

            Route::get('payments', [Admin\PaymentController::class, 'index']);
            Route::post('payments/{payment}/verify', [Admin\PaymentController::class, 'verify']);
            Route::post('payments/{payment}/refund', [Admin\PaymentController::class, 'refund']);   // super_admin (Gate)

            Route::get('customers', [Admin\CustomerController::class, 'index']);
            Route::get('customers/{customer}', [Admin\CustomerController::class, 'show']);
            Route::patch('customers/{customer}/status', [Admin\CustomerController::class, 'updateStatus']);

            Route::get('deliveries', [Admin\DeliveryController::class, 'index']);
            Route::patch('deliveries/{delivery}', [Admin\DeliveryController::class, 'update']);

            Route::get('reviews', [Admin\ReviewController::class, 'index']);
            Route::patch('reviews/{review}/status', [Admin\ReviewController::class, 'updateStatus']);
            Route::delete('reviews/{review}', [Admin\ReviewController::class, 'destroy']);

            Route::get('settings', [Admin\SettingsController::class, 'show']);
            Route::put('settings', [Admin\SettingsController::class, 'update']);  // super_admin (Gate)
        });
    });
});
