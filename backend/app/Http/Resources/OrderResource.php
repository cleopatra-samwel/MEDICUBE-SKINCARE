<?php

namespace App\Http\Resources;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->when($isStaff, $this->id),
            'order_number' => $this->order_number,
            'is_guest' => $this->is_guest,
            'customer' => [
                'name' => $this->customer_name,
                'phone' => $this->customer_phone,
                'email' => $this->customer_email,
                'user_id' => $this->when($isStaff, $this->user_id),
            ],
            'delivery_address' => [
                'region' => $this->region,
                'district' => $this->district,
                'street' => $this->street,
                'address_line' => $this->address_line,
                'notes' => $this->notes,
            ],
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => [
                'product_id' => $i->product_id,
                'name' => $i->product_name,
                'sku' => $i->product_sku,
                'image' => $i->product_image,
                'unit_price' => $i->unit_price,
                'quantity' => $i->quantity,
                'line_total' => $i->line_total,
            ])),
            'items_count' => $this->whenLoaded('items', fn () => $this->items->sum('quantity')),
            'subtotal' => $this->subtotal,
            'delivery_fee' => $this->delivery_fee,
            'discount' => $this->discount,
            'total' => $this->total,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'payment_status' => $this->payment_status->value,
            'allowed_transitions' => $this->when($isStaff, fn () => array_map(fn ($s) => $s->value, $this->status->allowedTransitions())),
            'timeline' => $this->timeline(),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'delivery' => $this->whenLoaded('delivery', fn () => $this->delivery ? [
                'status' => $this->delivery->status->value,
                'rider_name' => $this->delivery->rider_name,
                'rider_phone' => $this->delivery->rider_phone,
                'scheduled_for' => $this->delivery->scheduled_for?->toDateString(),
                'dispatched_at' => $this->delivery->dispatched_at?->toIso8601String(),
                'delivered_at' => $this->delivery->delivered_at?->toIso8601String(),
                'notes' => $isStaff ? $this->delivery->notes : null,
            ] : null),
            'history' => $this->when($isStaff && $this->relationLoaded('statusHistory'), fn () => $this->statusHistory->map(fn ($h) => [
                'from' => $h->from_status,
                'to' => $h->to_status,
                'note' => $h->note,
                'at' => $h->created_at?->toIso8601String(),
            ])),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Customer-facing progress: Order placed → Payment confirmed → Processing
     * → Out for delivery → Delivered. Each step is done, current, or upcoming.
     */
    private function timeline(): array
    {
        if ($this->status === OrderStatus::Cancelled) {
            return [
                ['key' => 'placed', 'label' => 'Order placed', 'state' => 'done'],
                ['key' => 'cancelled', 'label' => 'Cancelled', 'state' => 'cancelled'],
            ];
        }

        $rank = array_search($this->status, OrderStatus::pipeline(), true);
        $paid = in_array($this->payment_status, [PaymentStatus::Paid, PaymentStatus::Refunded], true);

        $steps = [
            ['key' => 'placed', 'label' => 'Order placed', 'done' => true],
            ['key' => 'paid', 'label' => 'Payment confirmed', 'done' => $paid],
            ['key' => 'processing', 'label' => 'Processing', 'done' => $rank >= 2],
            ['key' => 'out_for_delivery', 'label' => 'Out for delivery', 'done' => $rank >= 4],
            ['key' => 'delivered', 'label' => 'Delivered', 'done' => $rank >= 5],
        ];

        $currentAssigned = false;
        return array_map(function ($step) use (&$currentAssigned) {
            $state = $step['done'] ? 'done' : ($currentAssigned ? 'upcoming' : 'current');
            if (! $step['done']) {
                $currentAssigned = true;
            }

            return ['key' => $step['key'], 'label' => $step['label'], 'state' => $state];
        }, $steps);
    }
}
