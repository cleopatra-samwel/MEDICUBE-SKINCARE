<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Public sign-up always creates a customer; staff accounts are created by a super admin. */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            ...$request->validated(),
            'role_id' => Role::query()->where('name', UserRole::Customer->value)->value('id'),
            'status' => 'active',
        ]);

        return $this->tokenResponse($user->load('role'), 'customer', 201);
    }

    /**
     * Customer sign-in. Staff may sign in here too; the response carries the role
     * and the frontend routes accordingly, but authorization is always enforced
     * per-request by the `role` middleware.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->attempt($request);

        return $this->tokenResponse($user, $user->isStaff() ? 'admin' : 'customer');
    }

    /** Admin sign-in: rejects customers even with the right password. */
    public function adminLogin(LoginRequest $request): JsonResponse
    {
        $user = $this->attempt($request);

        if (! $user->isStaff()) {
            return response()->json(['message' => 'This account does not have admin access.'], 403);
        }

        return $this->tokenResponse($user, 'admin');
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    private function attempt(LoginRequest $request): User
    {
        $user = User::query()->where('email', strtolower($request->email))->first();

        // Same message for unknown email and wrong password (no account enumeration).
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['The email or password is incorrect.']]);
        }
        if (! $user->isActive()) {
            throw ValidationException::withMessages(['email' => ['This account has been suspended. Contact support for help.']]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        return $user;
    }

    private function tokenResponse(User $user, string $tokenName, int $status = 200): JsonResponse
    {
        $abilities = $user->isStaff() ? ['admin', 'customer'] : ['customer'];
        $token = $user->createToken($tokenName, $abilities)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
            'redirect_to' => $user->isStaff() ? '/admin/dashboard' : '/profile',
        ], $status);
    }
}
