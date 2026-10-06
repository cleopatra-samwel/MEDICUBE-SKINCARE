<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isStaff = (bool) $request->user()?->isStaff();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'ingredients' => $this->ingredients,
            'benefits' => $this->benefits ?? [],
            'skin_types' => $this->skin_types ?? [],
            'how_to_use' => $this->how_to_use,
            'size' => $this->size,
            'price' => $this->price,
            'compare_at_price' => $this->compare_at_price,
            'status' => $this->status->value,
            'in_stock' => $this->isPurchasable(),
            // Exact stock is only for staff; customers see a "low stock" hint.
            'stock' => $isStaff ? $this->stock : null,
            'low_stock' => $this->stock > 0 && $this->stock <= $this->low_stock_threshold,
            'max_quantity' => $this->isPurchasable() ? min($this->stock, 99) : 0,
            'low_stock_threshold' => $this->when($isStaff, $this->low_stock_threshold),
            'sold_count' => $this->when($isStaff, $this->sold_count),
            'is_featured' => $this->is_featured,
            'rating' => round((float) $this->rating_avg, 1),
            'rating_count' => $this->rating_count,
            'category' => $this->whenLoaded('category', fn () => $this->category ? ['id' => $this->category->id, 'name' => $this->category->name, 'slug' => $this->category->slug] : null),
            'image' => $this->whenLoaded('primaryImage', fn () => $this->primaryImage?->url()),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
