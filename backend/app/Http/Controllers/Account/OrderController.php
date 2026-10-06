<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return OrderResource::collection(
            $request->user()->orders()->with(['items', 'delivery'])->latest()->paginate(10)
        );
    }

    public function show(Request $request, Order $order): OrderResource
    {
        $this->authorize('view', $order);

        return new OrderResource($order->load(['items', 'delivery', 'payments']));
    }
}
