<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Usage: ->middleware('role:admin,superadmin')  (any of the listed roles).
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user('staff');

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->hasRole(...$roles)) {
            return $next($request);
        }

        return response()->json(['message' => 'Accès refusé : rôle insuffisant.'], 403);
    }
}
