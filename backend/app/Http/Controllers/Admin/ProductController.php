<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->with(['category', 'primaryImage']);

        if ($term = $request->string('q')->trim()->toString()) {
            $like = '%'.$term.'%';
            $query->where(fn ($q) => $q->where('name', 'ILIKE', $like)->orWhere('sku', 'ILIKE', $like));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        return ProductResource::collection($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load(['category', 'images', 'primaryImage']));
    }

    public function store(ProductRequest $request): ProductResource
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?: $this->uniqueSlug($data['name']);
        $product = new Product($data);
        $product->syncStockStatus();
        $product->save();

        return new ProductResource($product->load(['category', 'images', 'primaryImage']));
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?: $product->slug;
        $product->fill($data);
        $product->syncStockStatus();
        $product->save();

        return new ProductResource($product->load(['category', 'images', 'primaryImage']));
    }

    public function updateStatus(Request $request, Product $product): ProductResource
    {
        $request->validate(['status' => ['required', Rule::in(ProductStatus::values())]]);
        $product->status = ProductStatus::from($request->status);
        $product->save();

        return new ProductResource($product->load(['category', 'primaryImage']));
    }

    /**
     * Products that appear in past orders are kept for order history: deactivate
     * them instead. Unused products are deleted with their images.
     */
    public function destroy(Product $product): JsonResponse
    {
        if (DB::table('order_items')->where('product_id', $product->id)->exists()) {
            return response()->json([
                'message' => 'This product appears in past orders. Deactivate it instead so order history stays intact.',
            ], 422);
        }

        foreach ($product->images()->get() as $image) {
            $this->deleteFile($image->path);
        }
        $product->forceDelete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function uploadImages(Request $request, Product $product): AnonymousResourceCollection
    {
        $request->validate([
            'images' => ['required', 'array', 'max:8'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096', 'dimensions:min_width=400,min_height=400'],
        ]);

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        $order = (int) $product->images()->max('sort_order');

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('products/'.$product->id, 'public');
            $product->images()->create([
                'path' => $path,
                'alt' => $product->name,
                'sort_order' => ++$order,
                'is_primary' => ! $hasPrimary && $i === 0,
            ]);
        }

        return \App\Http\Resources\ProductImageResource::collection($product->images()->get());
    }

    public function setPrimaryImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, 404);
        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['message' => 'Main image updated.']);
    }

    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_unless($image->product_id === $product->id, 404);
        $this->deleteFile($image->path);
        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $product->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Image removed.']);
    }

    private function deleteFile(string $path): void
    {
        if (! Str::startsWith($path, ['http://', 'https://', '/'])) {
            Storage::disk('public')->delete($path);
        }
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
