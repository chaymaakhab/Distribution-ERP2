<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\PickingList;
use App\Models\PickingItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreparationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PickingList::with(['order.customer', 'warehouse', 'preparator', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $picking = PickingList::with(['order.customer', 'warehouse', 'preparator', 'items.product'])->findOrFail($id);
        return response()->json($picking);
    }

    public function scanItem(Request $request, int $pickingId): JsonResponse
    {
        $validated = $request->validate([
            'barcode' => 'required|string',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $picking = PickingList::with('items.product')->findOrFail($pickingId);
        $qtyToAdd = $validated['quantity'] ?? 1;

        $targetItem = null;
        foreach ($picking->items as $item) {
            if ($item->product?->barcode === $validated['barcode'] || $item->scanned_barcode === $validated['barcode']) {
                $targetItem = $item;
                break;
            }
        }

        if (!$targetItem) {
            return response()->json([
                'success' => false,
                'message' => 'Article non trouvé dans cette commande de préparation pour ce code-barres.',
            ], 404);
        }

        $newPrepared = min($targetItem->requested_quantity, $targetItem->prepared_quantity + $qtyToAdd);
        $status = $newPrepared >= $targetItem->requested_quantity ? 'ok' : 'short';

        $targetItem->update([
            'prepared_quantity' => $newPrepared,
            'scanned_barcode' => $validated['barcode'],
            'status' => $status,
        ]);

        // Check if all items in picking are ok
        $allOk = true;
        foreach ($picking->items()->get() as $it) {
            if ($it->prepared_quantity < $it->requested_quantity) {
                $allOk = false;
                break;
            }
        }

        if ($allOk) {
            $picking->update([
                'status' => 'termine',
                'completed_at' => now(),
            ]);

            // Update order status to 'Prêt' or 'Préparé'
            $picking->order?->update(['status' => 'Préparé']);
        }

        return response()->json([
            'success' => true,
            'item' => $targetItem->load('product'),
            'picking_status' => $picking->fresh()->status,
        ]);
    }
}
