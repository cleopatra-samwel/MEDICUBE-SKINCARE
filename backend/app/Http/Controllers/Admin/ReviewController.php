<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Review::query()->with('product');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return ReviewResource::collection($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function updateStatus(Request $request, Review $review): ReviewResource
    {
        $data = $request->validate(['status' => ['required', Rule::in(ReviewStatus::values())]]);
        $review->update($data);
        $review->loadMissing('product');
        $review->product?->recalculateRating();

        return new ReviewResource($review->load('product'));
    }

    public function destroy(Review $review): JsonResponse
    {
        $product = $review->loadMissing('product')->product;
        $review->delete();
        $product?->recalculateRating();

        return response()->json(['message' => 'Review deleted.']);
    }
}
