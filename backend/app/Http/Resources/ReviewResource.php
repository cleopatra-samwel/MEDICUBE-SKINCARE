<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'is_verified_purchase' => $this->is_verified_purchase,
            'status' => $this->when($request->user()?->isStaff(), fn () => $this->status->value),
            'product' => $this->whenLoaded('product', fn () => ['id' => $this->product->id, 'name' => $this->product->name, 'slug' => $this->product->slug]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
