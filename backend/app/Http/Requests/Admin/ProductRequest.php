<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isStaff();
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:160', 'alpha_dash', Rule::unique('products', 'slug')->ignore($productId)],
            'sku' => ['required', 'string', 'max:64', Rule::unique('products', 'sku')->ignore($productId)],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:10000'],
            'ingredients' => ['nullable', 'string', 'max:5000'],
            'benefits' => ['nullable', 'array', 'max:12'],
            'benefits.*' => ['string', 'max:120'],
            'skin_types' => ['nullable', 'array', 'max:10'],
            'skin_types.*' => ['string', 'max:40'],
            'how_to_use' => ['nullable', 'string', 'max:3000'],
            'size' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'compare_at_price' => ['nullable', 'integer', 'gt:price'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'status' => ['required', Rule::in(ProductStatus::values())],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }
}
