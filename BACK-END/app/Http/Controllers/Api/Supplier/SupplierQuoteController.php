<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierQuoteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'quotes' => [
                ['id' => 1, 'ref' => 'DEV-FOURN-014', 'date' => '2025-02-26', 'amount' => 42000.00, 'status' => 'Proposé'],
                ['id' => 2, 'ref' => 'DEV-FOURN-013', 'date' => '2025-02-18', 'amount' => 15800.00, 'status' => 'Accepté'],
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'details' => 'required|string',
        ]);

        return response()->json([
            'message' => 'Devis soumis avec succès.',
            'quote' => [
                'id' => rand(10, 99),
                'ref' => 'DEV-FOURN-' . rand(100, 999),
                'amount' => (float) $request->amount,
                'details' => $request->details,
                'status' => 'Proposé',
                'created_at' => now()->toDateTimeString(),
            ]
        ], 201);
    }
}
