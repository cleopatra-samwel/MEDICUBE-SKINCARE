<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatalogController extends Controller
{
    public function categories(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->visible()])
            ->orderBy('sort_order')->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function products(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:120'],
            'min_price' => ['nullable', 'integer', 'min:0'],
            'max_price' => ['nullable', 'integer', 'min:0'],
            'availability' => ['nullable', 'in:in_stock,out_of_stock'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,popular,rating,name'],
            'featured' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $query = Product::query()->visible()->with(['category', 'primaryImage']);

        if ($term = $request->string('q')->trim()->toString()) {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $term).'%';
            $query->where(fn ($q) => $q->where('name', 'ILIKE', $like)
                ->orWhere('short_description', 'ILIKE', $like)
                ->orWhere('ingredients', 'ILIKE', $like));
        }
        if ($slug = $request->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $slug));
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->max_price);
        }
        if ($request->availability === 'in_stock') {
            $query->where('status', 'ACTIVE')->where('stock', '>', 0);
        } elseif ($request->availability === 'out_of_stock') {
            $query->where(fn ($q) => $q->where('status', 'OUT_OF_STOCK')->orWhere('stock', 0));
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        match ($request->input('sort', 'newest')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('sold_count'),
            'rating' => $query->orderByDesc('rating_avg')->orderByDesc('rating_count'),
            'name' => $query->orderBy('name'),
            default => $query->latest(),
        };

        return ProductResource::collection($query->paginate($request->integer('per_page', 12))->withQueryString());
    }

    /** Accepts a slug or a numeric id so both /products/vitamin-c-serum and /products/12 work. */
    public function product(string $key): ProductResource
    {
        $product = Product::query()->visible()
            ->with(['category', 'images', 'primaryImage'])
            ->where(fn ($q) => ctype_digit($key) ? $q->where('id', (int) $key) : $q->where('slug', $key))
            ->firstOrFail();

        return new ProductResource($product);
    }

    public function related(string $key): AnonymousResourceCollection
    {
        $product = Product::query()->where(ctype_digit($key) ? 'id' : 'slug', $key)->firstOrFail();

        $related = Product::query()->visible()->with(['category', 'primaryImage'])
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->orderByDesc('sold_count')->limit(4)->get();

        return ProductResource::collection($related);
    }

    /** Settings the storefront needs: delivery fees, regions, payment methods. */
    public function config(SettingsService $settings, PaymentGatewayManager $payments): JsonResponse
    {
        $s = $settings->all();

        return response()->json([
            'currency' => config('shop.currency'),
            'store' => [
                'name' => $s['store_name'],
                'email' => $s['store_email'],
                'phone' => $s['store_phone'],
                'address' => $s['store_address'],
            ],
            'delivery' => [
                'default_fee' => (int) $s['delivery_fee_default'],
                'fees_by_region' => $s['delivery_fees_by_region'],
                'free_delivery_threshold' => (int) $s['free_delivery_threshold'],
            ],
            'regions' => config('shop.regions'),
            'payment_methods' => $payments->enabledMethods(),
        ]);
    }
}
