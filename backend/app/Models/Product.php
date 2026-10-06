<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'sku', 'short_description', 'description', 'ingredients',
        'benefits', 'skin_types', 'how_to_use', 'size', 'price', 'compare_at_price', 'stock',
        'low_stock_threshold', 'status', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'benefits' => 'array',
            'skin_types' => 'array',
            'price' => 'integer',
            'compare_at_price' => 'integer',
            'stock' => 'integer',
            'low_stock_threshold' => 'integer',
            'status' => ProductStatus::class,
            'is_featured' => 'boolean',
            'rating_avg' => 'float',
            'rating_count' => 'integer',
            'sold_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderByDesc('is_primary')->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->orderByDesc('is_primary')->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** Products customers can see: active or temporarily out of stock. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->whereIn('status', [ProductStatus::Active->value, ProductStatus::OutOfStock->value]);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'low_stock_threshold');
    }

    public function isPurchasable(): bool
    {
        return $this->status === ProductStatus::Active && $this->stock > 0;
    }

    /** Keep status in step with stock after any stock change. */
    public function syncStockStatus(): void
    {
        if ($this->status === ProductStatus::Inactive) {
            return;
        }
        $this->status = $this->stock > 0 ? ProductStatus::Active : ProductStatus::OutOfStock;
    }

    public function recalculateRating(): void
    {
        $approved = $this->reviews()->where('status', 'APPROVED');
        $this->rating_count = $approved->count();
        $this->rating_avg = round((float) $approved->avg('rating'), 2);
        $this->saveQuietly();
    }
}
