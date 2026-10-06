<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\QuoteRequest;
use App\Services\CartPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartPricingService $pricing) {}

    /** Public: price a cart (guest carts live in the browser and are priced here). */
    public function quote(QuoteRequest $request): JsonResponse
    {
        return response()->json($this->present($this->pricing->quote($request->input('items', []), $request->input('region'))));
    }

    /** Signed-in: the saved server-side cart. */
    public function show(Request $request): JsonResponse
    {
        $lines = $request->user()->cartItems()->get(['product_id', 'quantity'])->toArray();

        return response()->json($this->present($this->pricing->quote($lines)));
    }

    /**
     * Signed-in: replace the saved cart. The frontend sends the full cart after
     * each change (and once after sign-in, merged with the guest cart).
     */
    public function sync(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['present', 'array', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $user = $request->user();
        $user->cartItems()->delete();
        foreach (collect($data['items'])->keyBy('product_id') as $item) {
            $user->cartItems()->create($item);
        }

        return $this->show($request);
    }

    private function present(array $quote): array
    {
        $quote['lines'] = array_map(function ($line) {
            unset($line['product']);

            return $line;
        }, $quote['lines']);

        return $quote;
    }
}
