<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'method' => $this->method,
            'gateway' => $this->when($isStaff, $this->gateway),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'provider_reference' => $this->when($isStaff, $this->provider_reference),
            'checkout_url' => $this->checkout_url,
            'customer_message' => $this->meta['customer_message'] ?? null,
            'failure_reason' => $this->failure_reason,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'order' => $this->when($isStaff && $this->relationLoaded('order'), fn () => [
                'order_number' => $this->order->order_number,
                'customer_name' => $this->order->customer_name,
            ]),
        ];
    }
}
