<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::query()->with(['items', 'delivery']);

        if ($term = $request->string('q')->trim()->toString()) {
            $like = '%'.$term.'%';
            $query->where(fn ($q) => $q->where('order_number', 'ILIKE', $like)
                ->orWhere('customer_name', 'ILIKE', $like)
                ->orWhere('customer_phone', 'ILIKE', $like)
                ->orWhere('customer_email', 'ILIKE', $like));
        }
        foreach (['status', 'payment_status', 'region'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }
        if ($request->filled('customer_type')) {
            $query->where('is_guest', $request->customer_type === 'guest');
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->date('to'));
        }

        return OrderResource::collection($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(['items', 'payments', 'delivery', 'statusHistory']));
    }

    public function updateStatus(Request $request, Order $order, OrderService $orders): OrderResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(OrderStatus::values())],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $order = $orders->transition($order->load('items', 'delivery'), OrderStatus::from($data['status']), $request->user(), $data['note'] ?? null);

        return new OrderResource($order);
    }
}
