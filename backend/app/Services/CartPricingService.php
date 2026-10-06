<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * The single source of truth for prices. The browser's cart only stores product
 * ids and quantities; everything monetary is recalculated here.
 */
class CartPricingService
{
    public function __construct(private readonly DeliveryFeeService $deliveryFees) {}

    /**
     * @param array<int, array{product_id:int, quantity:int}> $lines
     * @return array{lines: array<int, array<string, mixed>>, subtotal:int, delivery_fee:int, total:int, issues: string[]}
     */
    public function quote(array $lines, ?string $region = null, bool $lockForUpdate = false): array
    {
        $quantities = $this->mergeQuantities($lines);
        $query = Product::query()->with('primaryImage')->whereIn('id', $quantities->keys());
        if ($lockForUpdate) {
            $query->lockForUpdate();
        }
        $products = $query->get()->keyBy('id');

        $result = [];
        $issues = [];
        $subtotal = 0;

        foreach ($quantities as $productId => $quantity) {
            /** @var Product|null $product */
            $product = $products->get($productId);

            if (! $product || ! $product->isPurchasable()) {
                $issues[] = ($product?->name ?? 'A product').' is no longer available.';
                $result[] = ['product_id' => $productId, 'available' => false, 'quantity' => 0, 'requested_quantity' => $quantity];
                continue;
            }

            $finalQty = min($quantity, $product->stock);
            if ($finalQty < $quantity) {
                $issues[] = "Only {$product->stock} of {$product->name} left in stock.";
            }

            $lineTotal = $product->price * $finalQty;
            $subtotal += $lineTotal;

            $result[] = [
                'product_id' => $product->id,
                'product' => $product,
                'available' => true,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $product->primaryImage?->url(),
                'unit_price' => $product->price,
                'stock' => $product->stock,
                'quantity' => $finalQty,
                'requested_quantity' => $quantity,
                'line_total' => $lineTotal,
            ];
        }

        $deliveryFee = $subtotal > 0 ? $this->deliveryFees->forRegion($region, $subtotal) : 0;

        return [
            'lines' => $result,
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total' => $subtotal + $deliveryFee,
            'issues' => $issues,
        ];
    }

    /** @return Collection<int, int> product_id => quantity */
    private function mergeQuantities(array $lines): Collection
    {
        return collect($lines)
            ->groupBy(fn ($l) => (int) $l['product_id'])
            ->map(fn ($group) => max(1, (int) $group->sum('quantity')));
    }
}
