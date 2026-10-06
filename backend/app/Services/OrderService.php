<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use App\Notifications\NewOrderPlaced;
use App\Support\Phone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private readonly CartPricingService $pricing) {}

    /**
     * Create an order from cart lines. Prices and stock are re-read inside a
     * transaction with row locks so two customers cannot buy the last unit.
     *
     * @param array<string, mixed> $customer  validated checkout fields
     * @param array<int, array{product_id:int, quantity:int}> $lines
     */
    public function place(array $customer, array $lines, ?User $user = null): Order
    {
        $order = DB::transaction(function () use ($customer, $lines, $user) {
            $quote = $this->pricing->quote($lines, $customer['region'], lockForUpdate: true);

            $unavailable = collect($quote['lines'])->contains(fn ($l) => ! $l['available'] || $l['quantity'] < $l['requested_quantity']);
            if ($unavailable || $quote['subtotal'] === 0) {
                throw ValidationException::withMessages([
                    'items' => $quote['issues'] ?: ['Your cart is empty.'],
                ]);
            }

            $order = Order::create([
                'order_number' => 'TMP-'.bin2hex(random_bytes(6)),
                'user_id' => $user?->id,
                'is_guest' => $user === null,
                'customer_name' => $customer['full_name'],
                'customer_phone' => Phone::clean($customer['phone']),
                'customer_phone_normalized' => Phone::normalize($customer['phone']),
                'customer_email' => $customer['email'] ?? null,
                'region' => $customer['region'],
                'district' => $customer['district'],
                'street' => $customer['street'],
                'address_line' => $customer['address_line'],
                'notes' => $customer['notes'] ?? null,
                'subtotal' => $quote['subtotal'],
                'delivery_fee' => $quote['delivery_fee'],
                'total' => $quote['total'],
                'currency' => config('shop.currency'),
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending,
            ]);

            // Human-friendly sequential number, e.g. SKN-10245.
            $order->order_number = config('shop.order_number_prefix').'-'.(config('shop.order_number_start') + $order->id);
            $order->save();

            foreach ($quote['lines'] as $line) {
                $product = $line['product'];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'product_image' => $line['image'],
                    'unit_price' => $line['unit_price'],
                    'quantity' => $line['quantity'],
                    'line_total' => $line['line_total'],
                ]);

                // Reserve stock at order time; released again if the order is cancelled.
                $product->stock -= $line['quantity'];
                $product->syncStockStatus();
                $product->save();
            }

            $order->statusHistory()->create(['to_status' => OrderStatus::Pending->value, 'note' => 'Order placed']);
            $order->delivery()->create(['status' => DeliveryStatus::Pending]);

            if ($user) {
                $user->cartItems()->delete();
            }

            return $order;
        });

        $staff = User::query()->whereHas('role', fn ($q) => $q->whereIn('name', ['admin', 'super_admin']))->get();
        Notification::send($staff, new NewOrderPlaced($order));

        return $order->load('items', 'delivery');
    }

    public function transition(Order $order, OrderStatus $next, ?User $actor = null, ?string $note = null): Order
    {
        if (! $order->status->canTransitionTo($next)) {
            throw ValidationException::withMessages([
                'status' => ["An order that is {$order->status->label()} cannot be moved to {$next->label()}."],
            ]);
        }

        if (in_array($next, [OrderStatus::OutForDelivery, OrderStatus::Delivered], true) && ! $order->isPaid()) {
            throw ValidationException::withMessages([
                'status' => ['This order has not been paid. Confirm the payment before dispatching it.'],
            ]);
        }

        $order->loadMissing(['items.product', 'delivery']);

        return DB::transaction(function () use ($order, $next, $actor, $note) {
            $from = $order->status;
            $order->status = $next;

            match ($next) {
                OrderStatus::Confirmed => $order->confirmed_at = now(),
                OrderStatus::Delivered => $order->delivered_at = now(),
                OrderStatus::Cancelled => $order->cancelled_at = now(),
                default => null,
            };
            $order->save();

            if ($next === OrderStatus::Cancelled) {
                $this->releaseStock($order);
            }
            if ($next === OrderStatus::Delivered) {
                foreach ($order->items as $item) {
                    $item->product?->increment('sold_count', $item->quantity);
                }
            }

            $this->syncDelivery($order, $next);

            $order->statusHistory()->create([
                'from_status' => $from->value,
                'to_status' => $next->value,
                'note' => $note,
                'changed_by' => $actor?->id,
            ]);

            return $order->fresh(['items', 'delivery', 'statusHistory', 'payments']);
        });
    }

    private function releaseStock(Order $order): void
    {
        foreach ($order->items()->with('product')->get() as $item) {
            if ($product = $item->product) {
                $product->stock += $item->quantity;
                $product->syncStockStatus();
                $product->save();
            }
        }
    }

    private function syncDelivery(Order $order, OrderStatus $status): void
    {
        $delivery = $order->delivery ?? $order->delivery()->create(['status' => DeliveryStatus::Pending]);
        $mapped = match ($status) {
            OrderStatus::ReadyForDelivery => DeliveryStatus::ReadyForDelivery,
            OrderStatus::OutForDelivery => DeliveryStatus::OutForDelivery,
            OrderStatus::Delivered => DeliveryStatus::Delivered,
            OrderStatus::Cancelled => DeliveryStatus::Failed,
            default => null,
        };
        if ($mapped && $delivery->status !== $mapped) {
            $delivery->status = $mapped;
            if ($mapped === DeliveryStatus::OutForDelivery) {
                $delivery->dispatched_at ??= now();
            }
            if ($mapped === DeliveryStatus::Delivered) {
                $delivery->delivered_at = now();
            }
            $delivery->save();
        }
    }
}
