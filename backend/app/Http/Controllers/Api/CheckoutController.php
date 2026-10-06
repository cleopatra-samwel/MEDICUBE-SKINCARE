<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    /** Works for guests and signed-in customers alike. */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $user = auth('sanctum')->user();   // optional: attaches the order to the account
        $data = $request->validated();

        $order = $this->orders->place($data, $data['items'], $user);

        if ($user && ($data['save_address'] ?? false)) {
            $user->addresses()->firstOrCreate(
                ['address_line' => $data['address_line'], 'region' => $data['region']],
                [
                    'full_name' => $data['full_name'], 'phone' => $data['phone'], 'district' => $data['district'],
                    'street' => $data['street'], 'notes' => $data['notes'] ?? null,
                    'is_default' => ! $user->addresses()->exists(),
                ]
            );
        }

        return (new OrderResource($order))
            ->additional(['message' => 'Your order has been placed.'])
            ->response()->setStatusCode(201);
    }
}
