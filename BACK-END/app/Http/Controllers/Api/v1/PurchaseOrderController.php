<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PurchaseOrder::with(['supplier', 'warehouse', 'items.product', 'receipts']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('ref', 'like', "%{$q}%")
                    ->orWhereHas('supplier', function ($supQuery) use ($q) {
                        $supQuery->where('name', 'like', "%{$q}%")
                                 ->orWhere('code', 'like', "%{$q}%");
                    });
            });
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $po = PurchaseOrder::with(['supplier', 'warehouse', 'items.product', 'receipts.items.product'])->findOrFail($id);
        return response()->json($po);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'required|string|unique:purchase_orders,ref',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date',
            'total_ht' => 'required|numeric|min:0',
            'tva_rate' => 'nullable|numeric',
            'vat_amount' => 'nullable|numeric|min:0',
            'total_ttc' => 'required|numeric|min:0',
            'status' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'notes' => 'nullable|string',
            'lines' => 'nullable|array',
            'lines.*.product_id' => 'required_with:lines|exists:products,id',
            'lines.*.quantity_ordered' => 'required_with:lines|integer|min:1',
            'lines.*.unit_price' => 'required_with:lines|numeric|min:0',
            'lines.*.unit' => 'nullable|string',
            'lines.*.total' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $po = PurchaseOrder::create([
                'ref' => $validated['ref'],
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'user_id' => $request->user()?->id,
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'total_ht' => $validated['total_ht'],
                'tva_rate' => $validated['tva_rate'] ?? 20.00,
                'vat_amount' => $validated['vat_amount'] ?? ($validated['total_ht'] * 0.20),
                'total_ttc' => $validated['total_ttc'],
                'status' => $validated['status'] ?? 'Brouillon',
                'payment_terms' => $validated['payment_terms'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['lines'])) {
                foreach ($validated['lines'] as $line) {
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $po->id,
                        'product_id' => $line['product_id'],
                        'quantity_ordered' => $line['quantity_ordered'],
                        'quantity_received' => 0,
                        'unit_price' => $line['unit_price'],
                        'unit' => $line['unit'] ?? 'Pièce',
                        'total' => $line['total'] ?? ($line['quantity_ordered'] * $line['unit_price']),
                    ]);
                }
            }

            return response()->json($po->load(['supplier', 'warehouse', 'items.product']), 201);
        });
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Brouillon,Envoyé,Confirmé,En transit,Reçu,Annulé',
        ]);

        $po = PurchaseOrder::findOrFail($id);
        $po->update(['status' => $validated['status']]);

        return response()->json($po);
    }
}
