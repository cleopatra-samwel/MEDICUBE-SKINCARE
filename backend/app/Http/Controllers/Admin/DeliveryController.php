<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DeliveryStatus;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Delivery::query()->with('order')->whereHas('order', fn ($q) => $q->where('status', '!=', 'CANCELLED'));

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('region')) {
            $query->whereHas('order', fn ($q) => $q->where('region', $request->region));
        }
        if ($term = $request->string('q')->trim()->toString()) {
            $like = '%'.$term.'%';
            $query->whereHas('order', fn ($q) => $q->where('order_number', 'ILIKE', $like)->orWhere('customer_name', 'ILIKE', $like)->orWhere('customer_phone', 'ILIKE', $like));
        }

        $page = $query->latest()->paginate($request->integer('per_page', 15));
        $page->getCollection()->transform(fn (Delivery $d) => $this->present($d));

        return response()->json($page);
    }

    /**
     * Update rider details and/or delivery status. Status changes go through the
     * order state machine so the order and its delivery never disagree.
     */
    public function update(Request $request, Delivery $delivery, OrderService $orders): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(DeliveryStatus::values())],
            'rider_name' => ['nullable', 'string', 'max:120'],
            'rider_phone' => ['nullable', 'string', 'max:20'],
            'scheduled_for' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($data, $delivery, $orders, $request) {
            $delivery->fill(collect($data)->except('status')->all())->save();

            if (! empty($data['status']) && $data['status'] !== $delivery->status->value) {
                $next = DeliveryStatus::from($data['status']);
                if ($orderStatus = $next->orderStatus()) {
                    $orders->transition($delivery->order()->with('items', 'delivery')->first(), $orderStatus, $request->user(), 'Delivery update');
                } else {
                    $delivery->update(['status' => $next]);
                }
            }
        });

        return response()->json($this->present($delivery->fresh('order')));
    }

    private function present(Delivery $d): array
    {
        $o = $d->order;

        return [
            'id' => $d->id,
            'order_number' => $o->order_number,
            'customer' => $o->customer_name,
            'phone' => $o->customer_phone,
            'location' => $o->district.', '.$o->region,
            'address' => $o->street.' · '.$o->address_line,
            'notes' => $o->notes,
            'status' => $d->status->value,
            'order_status' => $o->status->value,
            'payment_status' => $o->payment_status->value,
            'amount' => $o->total,
            'rider_name' => $d->rider_name,
            'rider_phone' => $d->rider_phone,
            'scheduled_for' => $d->scheduled_for?->toDateString(),
            'delivery_notes' => $d->notes,
            'created_at' => $o->created_at?->toIso8601String(),
        ];
    }
}
