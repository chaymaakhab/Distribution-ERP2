<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierOrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'orders' => [
                ['id' => 101, 'ref' => 'ACH-2025-089', 'date' => '2025-02-27', 'total_ttc' => 34500.00, 'status' => 'En attente de confirmation'],
                ['id' => 102, 'ref' => 'ACH-2025-088', 'date' => '2025-02-25', 'total_ttc' => 18900.00, 'status' => 'Réceptionnée'],
            ]
        ]);
    }

    public function show($id)
    {
        return response()->json([
            'id' => (int) $id,
            'ref' => 'ACH-2025-089',
            'date' => '2025-02-27',
            'status' => 'En attente de confirmation',
            'items' => [
                ['product' => 'Perceuse 850W', 'qty' => 20, 'price' => 1200.00, 'total' => 24000.00],
                ['product' => 'Disque diamant 230mm', 'qty' => 50, 'price' => 180.00, 'total' => 9000.00],
            ],
            'total_ht' => 33000.00,
            'tva' => 1500.00,
            'total_ttc' => 34500.00,
        ]);
    }
}
