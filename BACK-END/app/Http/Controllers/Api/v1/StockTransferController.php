<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockTransferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockTransfer::with([
            'sourceWarehouse',
            'destinationWarehouse',
            'driver',
            'items.product',
            'createdBy',
            'validatedBy',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('source_warehouse_id')) {
            $query->where('source_warehouse_id', $request->input('source_warehouse_id'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'required|string|unique:stock_transfers,ref',
            'source_warehouse_id' => 'required|exists:warehouses,id',
            'destination_warehouse_id' => 'required|exists:warehouses,id|different:source_warehouse_id',
            'driver_id' => 'nullable|exists:drivers,id',
            'vehicle_plate' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.lot_number' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $transfer = StockTransfer::create([
                'ref' => $validated['ref'],
                'source_warehouse_id' => $validated['source_warehouse_id'],
                'destination_warehouse_id' => $validated['destination_warehouse_id'],
                'driver_id' => $validated['driver_id'] ?? null,
                'vehicle_plate' => $validated['vehicle_plate'] ?? null,
                'created_by_user_id' => $request->user()?->id,
                'status' => 'en_preparation',
                'departure_date' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                StockTransferItem::create([
                    'stock_transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'quantity_sent' => $item['quantity'],
                    'quantity_received' => 0,
                    'lot_number' => $item['lot_number'] ?? null,
                ]);

                // Record stock movement (out from source)
                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $validated['source_warehouse_id'],
                    'user_id' => $request->user()?->id,
                    'movement_type' => 'transfert_sortie',
                    'reference_doc' => $transfer->ref,
                    'quantity' => -$item['quantity'],
                    'lot_number' => $item['lot_number'] ?? null,
                    'reason' => 'Transfert inter-dépôts vers ' . $transfer->destinationWarehouse?->name,
                ]);
            }

            return response()->json($transfer->load(['sourceWarehouse', 'destinationWarehouse', 'driver', 'items.product']), 201);
        });
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:brouillon,en_preparation,en_transit,recu,annule',
        ]);

        $transfer = StockTransfer::with('items')->findOrFail($id);

        if ($validated['status'] === 'recu' && $transfer->status !== 'recu') {
            DB::transaction(function () use ($transfer, $request) {
                $transfer->update([
                    'status' => 'recu',
                    'arrival_date' => now(),
                    'validated_by_user_id' => $request->user()?->id,
                ]);

                foreach ($transfer->items as $item) {
                    $item->update(['quantity_received' => $item->quantity_sent]);

                    // Add to destination stock
                    $destStock = Stock::firstOrCreate(
                        ['product_id' => $item->product_id, 'warehouse_id' => $transfer->destination_warehouse_id],
                        ['on_hand' => 0, 'reserved' => 0, 'min_threshold' => 10]
                    );
                    $destStock->increment('on_hand', $item->quantity_sent);

                    // Record stock movement (in to destination)
                    StockMovement::create([
                        'product_id' => $item->product_id,
                        'warehouse_id' => $transfer->destination_warehouse_id,
                        'user_id' => $request->user()?->id,
                        'movement_type' => 'transfert_entree',
                        'reference_doc' => $transfer->ref,
                        'quantity' => $item->quantity_sent,
                        'lot_number' => $item->lot_number,
                        'reason' => 'Réception transfert inter-dépôts',
                    ]);
                }
            });
        } else {
            $transfer->update(['status' => $validated['status']]);
        }

        return response()->json($transfer);
    }
}
