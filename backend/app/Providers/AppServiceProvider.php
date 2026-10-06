<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\User;
use App\Policies\OrderPolicy;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\SettingsService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SettingsService::class);
        $this->app->singleton(PaymentGatewayManager::class);
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
        Model::preventLazyLoading(! $this->app->isProduction());

        Gate::policy(Order::class, OrderPolicy::class);
        Gate::define('manage-settings', fn (User $user) => $user->isSuperAdmin());
        Gate::define('refund-payments', fn (User $user) => $user->isSuperAdmin());
        Gate::define('manage-customers', fn (User $user) => $user->isStaff());

        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(6)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('tracking', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));
        RateLimiter::for('forms', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()));
    }
}
