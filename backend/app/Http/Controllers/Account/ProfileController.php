<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ChangePasswordRequest;
use App\Http\Requests\Account\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        $request->user()->update($request->validated());

        return new UserResource($request->user()->fresh());
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['password' => $request->password]);
        // Sign out every other device.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password updated.']);
    }
}
