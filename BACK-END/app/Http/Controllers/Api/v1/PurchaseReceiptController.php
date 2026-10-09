<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseReceiptController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PurchaseReceipt::with([
            'supplier',
            'warehouse',
            'purchaseOrder',
            'receivedBy',
            'items.product',
        ]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('ref', 'like', "%{$q}%")
                    ->orWhere('supplier_delivery_ref', 'like', "%{$q}%")
                    ->orWhereHas('supplier', function ($sQuery) use ($q) {
                        $sQuery->where('name', 'like', "%{$q}%")
                               ->orWhere('code', 'like', "%{$q}%");
                    });
            });
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $receipt = PurchaseReceipt::with([
            'supplier',
            'warehouse',
            'purchaseOrder',
            'receivedBy',
            'items.product',
        ])->findOrFail($id);

        return response()->json($receipt);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'nullable|string|unique:purchase_receipts,ref',
            'purchase_order_id' => 'nullable|exists:purchase_orders,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'receipt_date' => 'required|date',
            'supplier_delivery_ref' => 'nullable|string',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity_received' => 'required|integer|min:1',
            'lines.*.unit_price' => 'nullable|numeric|min:0',
            'lines.*.lot_number' => 'nullable|string',
            'lines.*.expiry_date' => 'nullable|string',
            'lines.*.condition' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $ref = $validated['ref'] ?? ('BR-' . date('Y') . '-' . str_pad((string) (PurchaseReceipt::count() + 1), 3, '0', STR_PAD_LEFT));

            $receipt = PurchaseReceipt::create([
                'ref' => $ref,
                'purchase_order_id' => $validated['purchase_order_id'] ?? null,
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'received_by_user_id' => $request->user()?->id,
                'receipt_date' => $validated['receipt_date'],
                'supplier_delivery_ref' => $validated['supplier_delivery_ref'] ?? null,
                'status' => $validated['status'] ?? 'Conforme',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['lines'] as $line) {
                PurchaseReceiptItem::create([
                    'purchase_receipt_id' => $receipt->id,
                    'product_id' => $line['product_id'],
                    'quantity_received' => $line['quantity_received'],
                    'unit_price' => $line['unit_price'] ?? 0.00,
                    'total' => round($line['quantity_received'] * ($line['unit_price'] ?? 0), 2),
                    'lot_number' => $line['lot_number'] ?? null,
                    'expiry_date' => $line['expiry_date'] ?? null,
                    'condition' => $line['condition'] ?? 'conforme',
                ]);

                // Increment warehouse stock
                $stock = Stock::firstOrCreate(
                    [
                        'product_id' => $line['product_id'],
                        'warehouse_id' => $validated['warehouse_id'],
                    ],
                    [
                        'on_hand' => 0,
                        'reserved' => 0,
                        'min_threshold' => 10,
                    ]
                );

                $stock->increment('on_hand', $line['quantity_received']);

                // Record Stock Movement
                StockMovement::create([
                    'product_id' => $line['product_id'],
                    'warehouse_id' => $validated['warehouse_id'],
                    'type' => 'reception_fournisseur',
                    'quantity' => $line['quantity_received'],
                    'reference' => $receipt->ref,
                    'user_id' => $request->user()?->id,
                    'notes' => 'Réception marchandise bon ' . $receipt->ref,
                ]);

                // If tied to purchase order, update quantity received
                if (!empty($validated['purchase_order_id'])) {
                    PurchaseOrderItem::where('purchase_order_id', $validated['purchase_order_id'])
                        ->where('product_id', $line['product_id'])
                        ->increment('quantity_received', $line['quantity_received']);
                }
            }

            // Update PO status if all items received
            if (!empty($validated['purchase_order_id'])) {
                $po = PurchaseOrder::with('items')->find($validated['purchase_order_id']);
                if ($po) {
                    $allReceived = $po->items->every(fn($i) => $i->quantity_received >= $i->quantity_ordered);
                    $po->update(['status' => $allReceived ? 'Reçu' : 'En transit']);
                }
            }

            return response()->json($receipt->load(['supplier', 'warehouse', 'items.product']), 201);
        });
    }
}
