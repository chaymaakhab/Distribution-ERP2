<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierProductController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'products' => [
                ['id' => 1, 'ref' => 'PRD-0018', 'name' => 'Perceuse à percussion 850W', 'unit_price' => 1249.00, 'stock' => 120, 'status' => 'Actif'],
                ['id' => 2, 'ref' => 'PRD-0017', 'name' => 'Disque diamant 230 mm', 'unit_price' => 189.50, 'stock' => 64, 'status' => 'Actif'],
            ]
        ]);
    }
}
