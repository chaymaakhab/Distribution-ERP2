<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\ProductReturn;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductReturn::with([
            'customer:id,code,name,company,city',
            'product:id,code,sku,name,image',
            'validator:id,name',
        ])->orderBy('id', 'desc');

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $returns = $query->get();

        return response()->json($returns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'product_id' => 'required|exists:products,id',
            'order_id' => 'nullable|exists:orders,id',
            'quantity' => 'required|integer|min:1',
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string', // sbab dyalo
            'condition' => 'required|string', // neuf_recommercialisable, defaillant_sav, deteriore
        ]);

        $nextNum = ProductReturn::count() + 1;
        $ref = 'RET-2026-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $return = ProductReturn::create([
            'ref' => $ref,
            'customer_id' => $validated['customer_id'],
            'product_id' => $validated['product_id'],
            'order_id' => $validated['order_id'] ?? null,
            'quantity' => $validated['quantity'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'condition' => $validated['condition'],
            'restock_approved' => false,
            'status' => 'En attente validation',
        ]);

        $return->load(['customer:id,code,name,company,city', 'product:id,code,sku,name,image']);

        return response()->json($return, 201);
    }

    public function validateReturn(Request $request, $id)
    {
        $return = ProductReturn::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Validé,Refusé',
            'restock_approved' => 'required|boolean', // wach saleh yrje3 l stock
            'superadmin_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($return, $validated, $request) {
            $return->update([
                'status' => $validated['status'],
                'restock_approved' => $validated['restock_approved'],
                'superadmin_notes' => $validated['superadmin_notes'] ?? null,
                'validated_by_user_id' => $request->user()?->id,
                'validated_at' => Carbon::now(),
            ]);

            // If SuperAdmin approves return to stock, increment warehouse stock!
            if ($validated['status'] === 'Validé' && $validated['restock_approved']) {
                $casa = Warehouse::firstWhere('code', 'DEP-01');
                if ($casa && $return->product_id) {
                    $stock = Stock::firstOrCreate(
                        ['product_id' => $return->product_id, 'warehouse_id' => $casa->id],
                        ['on_hand' => 0, 'reserved' => 0, 'min_threshold' => 10]
                    );
                    $stock->increment('on_hand', $return->quantity);
                }
            }

            $return->load(['customer:id,code,name,company,city', 'product:id,code,sku,name,image', 'validator:id,name']);

            return response()->json([
                'message' => 'Décision SuperAdmin enregistrée avec succès',
                'return' => $return,
            ]);
        });
    }
}
