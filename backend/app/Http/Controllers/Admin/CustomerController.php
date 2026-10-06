<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->customers()
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn ($q) => $q->where('payment_status', 'PAID')], 'total');

        if ($term = $request->string('q')->trim()->toString()) {
            $like = '%'.$term.'%';
            $query->where(fn ($q) => $q->where('name', 'ILIKE', $like)->orWhere('email', 'ILIKE', $like)->orWhere('phone', 'ILIKE', $like));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $page = $query->latest()->paginate($request->integer('per_page', 15));

        // Only what the team needs: no password hashes, tokens or login metadata.
        $page->getCollection()->transform(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'phone' => $u->phone,
            'orders_count' => $u->orders_count,
            'total_spent' => (int) $u->total_spent,
            'status' => $u->status,
            'registered_at' => $u->created_at?->toIso8601String(),
        ]);

        return response()->json($page);
    }

    public function show(User $customer): JsonResponse
    {
        abort_unless($customer->hasRole('customer'), 404);

        return response()->json([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'status' => $customer->status,
                'registered_at' => $customer->created_at?->toIso8601String(),
            ],
            'orders' => OrderResource::collection($customer->orders()->with('items')->latest()->limit(20)->get()),
        ]);
    }

    public function updateStatus(Request $request, User $customer): JsonResponse
    {
        abort_unless($customer->hasRole('customer'), 404);
        $data = $request->validate(['status' => ['required', 'in:active,suspended']]);
        $customer->update($data);
        if ($data['status'] === 'suspended') {
            $customer->tokens()->delete();
        }

        return response()->json(['message' => $data['status'] === 'suspended' ? 'Customer suspended.' : 'Customer reactivated.']);
    }
}
