<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __invoke(AnalyticsService $analytics): JsonResponse
    {
        return response()->json([
            'totals' => [
                'revenue' => $analytics->revenue(),
                'orders' => $analytics->ordersCount(),
                'average_order_value' => $analytics->averageOrderValue(),
                'revenue_this_month' => $analytics->revenue(now()->startOfMonth()),
            ],
            'daily' => $analytics->salesSeries('day', 30),
            'weekly' => $analytics->salesSeries('week', 12),
            'monthly' => $analytics->salesSeries('month', 12),
            'best_sellers' => $analytics->bestSellers(10),
            'low_stock' => ProductResource::collection(Product::query()->where('status', '!=', 'INACTIVE')->lowStock()->orderBy('stock')->limit(10)->get()),
            'customer_growth' => $analytics->customerGrowth(12),
            'orders_by_status' => $analytics->ordersByStatus(),
        ]);
    }
}
