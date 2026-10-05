<?php

namespace App\Http\Controllers\Api\v1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function balance(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $totalInvoiced = (float) $customer->invoices()->sum('total_ttc');
        $totalPaid = (float) $customer->invoices()->sum('paid_amount');
        $remaining = round($totalInvoiced - $totalPaid, 2);
        $creditLimit = (float) $customer->credit_limit;

        return response()->json([
            'data' => [
                'total_invoiced' => round($totalInvoiced, 2),
                'total_paid' => round($totalPaid, 2),
                'remaining' => $remaining,
                'credit_limit' => $creditLimit,
                'credit_used' => $remaining,
                'credit_available' => round(max(0, $creditLimit - $remaining), 2),
                'orders_count' => $customer->orders()->count(),
                'unpaid_invoices' => $customer->invoices()->where('status', '!=', 'Payée')->count(),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $data = $request->validate([
            'company' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'locale' => ['nullable', 'string', 'in:fr,ar'],
        ]);

        $customer->fill($data)->save();

        return response()->json([
            'data' => AuthController::presentCustomer($customer->fresh('commercial')),
            'message' => 'Profil mis à jour.',
        ]);
    }
}
