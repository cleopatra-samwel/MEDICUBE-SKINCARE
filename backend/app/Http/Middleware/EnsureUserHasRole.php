<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage: ->middleware('role:admin,super_admin')
 * The role is read from the database on every request, so a token issued to a
 * customer can never reach an admin endpoint, whatever the frontend does.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Please sign in to continue.'], 401);
        }

        if (! $user->hasRole(...$roles)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }

        return $next($request);
    }
}
