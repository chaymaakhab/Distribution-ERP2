<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierDashboardController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'metrics' => [
                'total_orders' => 28,
                'pending_orders' => 4,
                'total_invoiced' => 450200.00,
                'balance_due' => 68400.00,
            ],
            'recent_orders' => [
                ['id' => 101, 'ref' => 'ACH-2025-089', 'date' => '2025-02-27', 'amount' => 34500.00, 'status' => 'En cours'],
                ['id' => 102, 'ref' => 'ACH-2025-088', 'date' => '2025-02-25', 'amount' => 18900.00, 'status' => 'Livrée'],
            ]
        ]);
    }
}
