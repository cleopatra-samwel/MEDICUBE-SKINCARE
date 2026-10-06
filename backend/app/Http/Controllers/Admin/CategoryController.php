<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(Category::query()->withCount('products')->orderBy('sort_order')->get());
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return new CategoryResource(Category::create($data));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? $category->slug;
        $category->update($data);

        return new CategoryResource($category->loadCount('products'));
    }

    public function uploadImage(Request $request, Category $category): CategoryResource
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096']]);
        $category->update(['image' => $request->file('image')->store('categories', 'public')]);

        return new CategoryResource($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json(['message' => 'Move or delete the products in this category first, or hide the category instead.'], 422);
        }
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
