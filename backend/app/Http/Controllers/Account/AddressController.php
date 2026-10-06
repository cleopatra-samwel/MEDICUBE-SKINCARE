<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\DeliveryAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return AddressResource::collection($request->user()->addresses()->orderByDesc('is_default')->latest()->get());
    }

    public function store(AddressRequest $request): AddressResource
    {
        $user = $request->user();
        $address = DB::transaction(function () use ($request, $user) {
            $makeDefault = $request->boolean('is_default') || ! $user->addresses()->exists();
            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            return $user->addresses()->create([...$request->validated(), 'is_default' => $makeDefault]);
        });

        return new AddressResource($address);
    }

    public function update(AddressRequest $request, DeliveryAddress $address): AddressResource
    {
        $this->ensureOwner($request, $address);
        DB::transaction(function () use ($request, $address) {
            if ($request->boolean('is_default')) {
                $request->user()->addresses()->update(['is_default' => false]);
            }
            $address->update($request->validated());
        });

        return new AddressResource($address->fresh());
    }

    public function destroy(Request $request, DeliveryAddress $address): JsonResponse
    {
        $this->ensureOwner($request, $address);
        $address->delete();

        return response()->json(['message' => 'Address removed.']);
    }

    private function ensureOwner(Request $request, DeliveryAddress $address): void
    {
        abort_unless($address->user_id === $request->user()->id, 404);
    }
}
