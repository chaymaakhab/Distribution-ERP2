<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierInvoiceController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'invoices' => [
                ['id' => 1, 'ref' => 'FAC-FOURN-2025-04', 'date' => '2025-02-20', 'due_date' => '2025-03-20', 'amount' => 34500.00, 'status' => 'Payée'],
                ['id' => 2, 'ref' => 'FAC-FOURN-2025-05', 'date' => '2025-02-27', 'due_date' => '2025-03-27', 'amount' => 18900.00, 'status' => 'Non payée'],
            ]
        ]);
    }
}
