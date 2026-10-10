<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\InventoryAudit;
use App\Models\InventoryAuditItem;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryAuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InventoryAudit::with(['warehouse', 'auditedBy', 'items.product']);

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $audit = InventoryAudit::with(['warehouse', 'auditedBy', 'items.product'])->findOrFail($id);
        return response()->json($audit);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'nullable|string|unique:inventory_audits,ref',
            'warehouse_id' => 'required|exists:warehouses,id',
            'audit_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.theoretical_qty' => 'required|integer',
            'items.*.physical_qty' => 'required|integer|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $ref = $validated['ref'] ?? ('INV-' . date('Y') . '-' . str_pad((string) (InventoryAudit::count() + 1), 2, '0', STR_PAD_LEFT));

            $discrepanciesCount = 0;
            foreach ($validated['items'] as $item) {
                if ($item['physical_qty'] !== $item['theoretical_qty']) {
                    $discrepanciesCount++;
                }
            }

            $audit = InventoryAudit::create([
                'ref' => $ref,
                'warehouse_id' => $validated['warehouse_id'],
                'audited_by_user_id' => $request->user()?->id,
                'audit_date' => $validated['audit_date'],
                'status' => 'en_cours',
                'total_items_counted' => count($validated['items']),
                'total_discrepancies' => $discrepanciesCount,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $diff = $item['physical_qty'] - $item['theoretical_qty'];
                InventoryAuditItem::create([
                    'inventory_audit_id' => $audit->id,
                    'product_id' => $item['product_id'],
                    'theoretical_quantity' => $item['theoretical_qty'],
                    'physical_quantity' => $item['physical_qty'],
                    'discrepancy' => $diff,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return response()->json($audit->load(['warehouse', 'items.product']), 201);
        });
    }

    public function adjustStock(Request $request, int $id): JsonResponse
    {
        $audit = InventoryAudit::with('items')->findOrFail($id);

        return DB::transaction(function () use ($audit, $request) {
            foreach ($audit->items as $item) {
                if ($item->discrepancy != 0) {
                    $stock = Stock::where('product_id', $item->product_id)
                        ->where('warehouse_id', $audit->warehouse_id)
                        ->first();

                    if ($stock) {
                        $stock->update(['on_hand' => $item->physical_quantity]);

                        StockMovement::create([
                            'product_id' => $item->product_id,
                            'warehouse_id' => $audit->warehouse_id,
                            'type' => 'ajustement_inventaire',
                            'quantity' => $item->discrepancy,
                            'reference' => $audit->ref,
                            'user_id' => $request->user()?->id,
                            'notes' => 'Ajustement inventaire ' . $audit->ref . ' (écart: ' . $item->discrepancy . ')',
                        ]);
                    }
                }
            }

            $audit->update(['status' => 'valide']);

            return response()->json([
                'message' => 'Stocks régularisés avec succès.',
                'audit' => $audit->load(['warehouse', 'items.product']),
            ]);
        });
    }
}
