<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/** PostgreSQL-specific reporting queries (date_trunc / generate_series). */
class AnalyticsService
{
    public function revenue(?\DateTimeInterface $since = null): int
    {
        return (int) Order::query()->where('payment_status', 'PAID')
            ->when($since, fn ($q) => $q->where('paid_at', '>=', $since))
            ->sum('total');
    }

    public function ordersCount(): int
    {
        return Order::query()->where('status', '!=', 'CANCELLED')->count();
    }

    public function averageOrderValue(): int
    {
        return (int) round((float) Order::query()->where('payment_status', 'PAID')->avg('total'));
    }

    /**
     * Revenue and order counts per period, including empty periods.
     *
     * @return array<int, array{period:string, revenue:int, orders:int}>
     */
    public function salesSeries(string $unit, int $periods): array
    {
        abort_unless(in_array($unit, ['day', 'week', 'month'], true), 400);

        $now = CarbonImmutable::now();
        $start = match ($unit) {
            'day' => $now->subDays($periods - 1)->startOfDay(),
            'week' => $now->subWeeks($periods - 1)->startOfWeek(),
            'month' => $now->subMonths($periods - 1)->startOfMonth(),
        };

        $rows = DB::select(
            "SELECT s.period, COALESCE(SUM(o.total), 0) AS revenue, COUNT(o.id) AS orders
             FROM generate_series(date_trunc(?, ?::timestamp), date_trunc(?, now()), ?::interval) AS s(period)
             LEFT JOIN orders o ON date_trunc(?, o.paid_at) = s.period AND o.payment_status = 'PAID'
             GROUP BY s.period ORDER BY s.period",
            [$unit, $start->toDateTimeString(), $unit, "1 $unit", $unit]
        );

        return array_map(fn ($r) => [
            'period' => CarbonImmutable::parse($r->period)->toDateString(),
            'revenue' => (int) $r->revenue,
            'orders' => (int) $r->orders,
        ], $rows);
    }

    /** @return array<int, array{product_id:int|null, name:string, quantity:int, revenue:int}> */
    public function bestSellers(int $limit): array
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.payment_status', 'PAID')
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc(DB::raw('SUM(order_items.quantity)'))
            ->limit($limit)
            ->get([
                'order_items.product_id',
                'order_items.product_name as name',
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.line_total) as revenue'),
            ])
            ->map(fn ($r) => ['product_id' => $r->product_id, 'name' => $r->name, 'quantity' => (int) $r->quantity, 'revenue' => (int) $r->revenue])
            ->all();
    }

    /** New customer accounts per month. */
    public function customerGrowth(int $months): array
    {
        $start = CarbonImmutable::now()->subMonths($months - 1)->startOfMonth();
        $counts = User::query()->customers()
            ->where('created_at', '>=', $start)
            ->selectRaw("date_trunc('month', created_at) as period, COUNT(*) as total")
            ->groupBy('period')->pluck('total', 'period')
            ->mapWithKeys(fn ($v, $k) => [CarbonImmutable::parse($k)->format('Y-m') => (int) $v]);

        $result = [];
        for ($i = 0; $i < $months; $i++) {
            $key = $start->addMonths($i)->format('Y-m');
            $result[] = ['period' => $key, 'customers' => $counts[$key] ?? 0];
        }

        return $result;
    }

    public function ordersByStatus(): array
    {
        return DB::table('orders')->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status')->map(fn ($v) => (int) $v)->all();
    }
}
