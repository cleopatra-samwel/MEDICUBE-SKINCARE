<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(Product $product): AnonymousResourceCollection
    {
        return ReviewResource::collection(
            $product->reviews()->where('status', ReviewStatus::Approved)->latest()->paginate(10)
        );
    }

    /** Latest approved reviews across the shop, for the homepage. */
    public function featured(): AnonymousResourceCollection
    {
        return ReviewResource::collection(
            Review::query()->with('product')->where('status', ReviewStatus::Approved)
                ->where('rating', '>=', 4)->latest()->limit(6)->get()
        );
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $user = auth('sanctum')->user();
        $data = $request->validate([
            'name' => [$user ? 'nullable' : 'required', 'string', 'max:100'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'title' => ['nullable', 'string', 'max:150'],
            'body' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $verified = $user && $user->orders()->where('payment_status', 'PAID')
            ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))->exists();

        $product->reviews()->create([
            ...$data,
            'name' => $user?->name ?? $data['name'],
            'user_id' => $user?->id,
            'status' => ReviewStatus::Pending,   // every review is moderated before it appears
            'is_verified_purchase' => $verified,
        ]);

        return response()->json(['message' => 'Thank you. Your review will appear once it has been approved.'], 201);
    }
}
