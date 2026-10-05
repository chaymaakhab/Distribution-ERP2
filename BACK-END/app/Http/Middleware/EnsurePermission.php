<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    /**
     * Usage: ->middleware('permission:orders.validate')
     * Multiple: 'permission:orders.view|orders.create' (any of them).
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user('staff');

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        foreach ($permissions as $group) {
            foreach (explode('|', $group) as $permission) {
                if ($user->hasPermission($permission)) {
                    return $next($request);
                }
            }
        }

        return response()->json(['message' => 'Accès refusé : permission insuffisante.'], 403);
    }
}
