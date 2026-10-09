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
            'commercial_id' => ['nullable', 'exists:users,id'],
            'commercial_code' => ['nullable', 'string', 'max:50'],
        ]);

        if (array_key_exists('commercial_id', $data) || array_key_exists('commercial_code', $data)) {
            $commId = $data['commercial_id'] ?? null;
            if ($commId) {
                $comm = \App\Models\User::find($commId);
            } elseif (!empty($data['commercial_code'])) {
                $comm = \App\Models\User::where('commercial_code', trim($data['commercial_code']))->first();
            } else {
                $comm = null;
            }

            if ($comm) {
                $customer->commercial_id = $comm->id;
                $customer->commercial_reference = $comm->commercial_code ?: ('COM-' . str_pad($comm->id, 3, '0', STR_PAD_LEFT));
                $customer->commission_percentage = $comm->commission_rate ?? 5.00;
            }
        }

        $customer->fill(collect($data)->except(['commercial_id', 'commercial_code'])->all())->save();

        return response()->json([
            'data' => AuthController::presentCustomer($customer->fresh('commercial')),
            'message' => 'Profil mis à jour.',
        ]);
    }

    public function chooseCommercial(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $data = $request->validate([
            'commercial_id' => ['nullable', 'exists:users,id'],
            'commercial_code' => ['nullable', 'string', 'max:50'],
        ]);

        $comm = null;
        if (!empty($data['commercial_id'])) {
            $comm = \App\Models\User::find($data['commercial_id']);
        } elseif (!empty($data['commercial_code'])) {
            $comm = \App\Models\User::where('commercial_code', trim($data['commercial_code']))->first();
        }

        if ($comm) {
            $customer->commercial_id = $comm->id;
            $customer->commercial_reference = $comm->commercial_code ?: ('COM-' . str_pad($comm->id, 3, '0', STR_PAD_LEFT));
            $customer->commission_percentage = $comm->commission_rate ?? 5.00;
            $customer->save();
        }

        return response()->json([
            'data' => AuthController::presentCustomer($customer->fresh('commercial')),
            'message' => 'Commercial référent assigné avec succès.',
        ]);
    }
}
