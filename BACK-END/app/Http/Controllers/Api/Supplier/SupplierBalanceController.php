<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierBalanceController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'supplier_id' => 1,
            'supplier_name' => 'Fournisseur Démo SARL',
            'total_invoiced' => 450200.00,
            'total_paid' => 381800.00,
            'current_balance' => 68400.00,
            'credit_limit' => 200000.00,
            'currency' => 'MAD',
        ]);
    }
}
