<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSubscription
{
    /**
     * Check if the authenticated staff user belongs to a company with an active SaaS subscription.
     * Super Admin (Mol SaaS) is always allowed.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('staff');

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        // Mol SaaS (superadmin) has unrestricted access to everything
        if ($user->hasRole('superadmin')) {
            return $next($request);
        }

        // If user belongs to a company, verify subscription
        if ($user->company_id) {
            $company = $user->company;

            if (!$company) {
                return response()->json([
                    'message' => 'Entreprise introuvable ou non assignée.',
                    'code' => 'COMPANY_NOT_FOUND',
                ], 403);
            }

            // Check if company is suspended by Mol SaaS
            if ($company->status === 'suspended' || $company->subscription_status === 'suspended') {
                return response()->json([
                    'message' => 'L\'accès de votre entreprise est actuellement suspendu par l\'administrateur SaaS. Veuillez contacter votre direction.',
                    'code' => 'SUBSCRIPTION_SUSPENDED',
                ], 403);
            }

            // Check if subscription has expired
            if ($company->is_expired || $company->subscription_status === 'expired') {
                return response()->json([
                    'message' => 'L\'abonnement SaaS de votre entreprise a expiré. Veuillez le renouveler pour continuer à utiliser l\'ERP.',
                    'code' => 'SUBSCRIPTION_EXPIRED',
                    'end_date' => $company->subscription_end_date?->format('Y-m-d'),
                ], 403);
            }
        }

        return $next($request);
    }
}
