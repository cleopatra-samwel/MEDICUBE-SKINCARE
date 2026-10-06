<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\TrackOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\Phone;
use Illuminate\Http\JsonResponse;

class TrackingController extends Controller
{
    public function __invoke(TrackOrderRequest $request): JsonResponse
    {
        $order = Order::query()
            ->with(['items', 'delivery'])
            ->where('order_number', strtoupper(trim($request->order_number)))
            ->where('customer_phone_normalized', Phone::normalize($request->phone))
            ->first();

        if (! $order) {
            return response()->json(['message' => 'No order matches that order number and phone number. Check both and try again.'], 404);
        }

        return response()->json(new OrderResource($order));
    }
}
