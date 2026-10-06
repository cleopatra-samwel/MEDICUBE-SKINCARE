<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(AnalyticsService $analytics): JsonResponse
    {
        $pendingStatuses = [OrderStatus::Pending, OrderStatus::Confirmed, OrderStatus::Processing, OrderStatus::ReadyForDelivery, OrderStatus::OutForDelivery];

        return response()->json([
            'stats' => [
                'total_products' => Product::query()->count(),
                'total_orders' => Order::query()->count(),
                'pending_orders' => Order::query()->whereIn('status', $pendingStatuses)->count(),
                'completed_orders' => Order::query()->where('status', OrderStatus::Delivered)->count(),
                'total_customers' => User::query()->customers()->count(),
                'total_revenue' => $analytics->revenue(),
                'low_stock_products' => Product::query()->where('status', '!=', 'INACTIVE')->lowStock()->count(),
            ],
            'sales_chart' => $analytics->salesSeries('day', 14),
            'recent_orders' => OrderResource::collection(Order::query()->with('items')->latest()->limit(6)->get()),
            'best_sellers' => $analytics->bestSellers(5),
            'low_stock' => ProductResource::collection(
                Product::query()->with('primaryImage')->where('status', '!=', 'INACTIVE')->lowStock()->orderBy('stock')->limit(6)->get()
            ),
        ]);
    }
}
