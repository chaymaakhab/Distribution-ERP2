<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierPaymentController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'payments' => [
                ['id' => 1, 'ref' => 'REG-FOURN-088', 'date' => '2025-02-22', 'method' => 'Virement bancaire', 'amount' => 34500.00, 'reference' => 'VIR-2025-8841'],
            ]
        ]);
    }
}
