<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\Payments\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Payment::query()->with('order');
        if ($term = $request->string('q')->trim()->toString()) {
            $like = '%'.$term.'%';
            $query->where(fn ($q) => $q->where('reference', 'ILIKE', $like)
                ->orWhere('provider_reference', 'ILIKE', $like)
                ->orWhereHas('order', fn ($o) => $o->where('order_number', 'ILIKE', $like)));
        }
        foreach (['status', 'method'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        return PaymentResource::collection($query->latest()->paginate($request->integer('per_page', 15)));
    }

    /** Re-check the status with the provider (useful if a webhook was missed). */
    public function verify(Payment $payment): PaymentResource
    {
        return new PaymentResource($this->payments->verify($payment)->load('order'));
    }

    public function refund(Request $request, Payment $payment): PaymentResource
    {
        Gate::authorize('refund-payments');
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);

        return new PaymentResource($this->payments->refund($payment, $data['reason'])->load('order'));
    }
}
