<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wishlist = $request->user()->wishlist()->firstOrCreate([]);
        $products = Product::query()->visible()->with(['category', 'primaryImage'])
            ->whereIn('id', $wishlist->items()->pluck('product_id'))->get();

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['product_id' => ['required', 'integer', 'exists:products,id']]);
        $wishlist = $request->user()->wishlist()->firstOrCreate([]);
        $wishlist->items()->firstOrCreate(['product_id' => $data['product_id']]);

        return response()->json(['message' => 'Saved to your wishlist.'], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $request->user()->wishlist()->firstOrCreate([])->items()->where('product_id', $productId)->delete();

        return response()->json(['message' => 'Removed from your wishlist.']);
    }
}
