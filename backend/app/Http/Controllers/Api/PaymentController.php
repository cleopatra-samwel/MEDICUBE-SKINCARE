<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\InitiatePaymentRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\Payments\PaymentService;
use App\Support\Phone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function initiate(InitiatePaymentRequest $request, Order $order): JsonResponse
    {
        $this->ensureOwnership($request, $order, $request->input('order_phone'));

        $payment = $this->payments->initiate($order, $request->input('method'), $request->input('payer_phone'));

        return response()->json([
            'payment' => new PaymentResource($payment),
            'message' => $payment->meta['customer_message'] ?? 'Payment started.',
        ], 201);
    }

    /** Polled by the payment page until the payment settles. */
    public function status(Request $request, Order $order): JsonResponse
    {
        $this->ensureOwnership($request, $order, $request->query('phone'));
        $order->load(['items', 'latestPayment', 'delivery']);

        return response()->json([
            'order' => new OrderResource($order),
            'payment' => $order->latestPayment ? new PaymentResource($order->latestPayment) : null,
        ]);
    }

    /** Provider → us. No auth: trust comes from the signature check in the gateway. */
    public function webhook(Request $request, string $gateway): JsonResponse
    {
        abort_unless(array_key_exists($gateway, config('payments.gateways')), 404);

        $result = $this->payments->handleCallback($gateway, $request);

        return response()->json(['result' => $result], $result === 'invalid_signature' ? 401 : 200);
    }

    /**
     * A guest proves ownership with the checkout phone number; a signed-in
     * customer must own the order. Mismatches look like "not found".
     */
    private function ensureOwnership(Request $request, Order $order, ?string $phone): void
    {
        $user = auth('sanctum')->user();
        if ($user && ($order->user_id === $user->id || $user->isStaff())) {
            return;
        }
        abort_unless($phone && Phone::normalize($phone) === $order->customer_phone_normalized, 404, 'Order not found.');
    }
}
