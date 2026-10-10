<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $query = Stock::with(['product.category', 'warehouse'])->orderBy('id', 'desc');

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->whereHas('product', function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('sku', 'like', "%{$q}%")
                  ->orWhere('code', 'like', "%{$q}%");
            });
        }

        $stocks = $query->get()->map(function ($s) {
            $warehouseLabel = $s->warehouse
                ? "{$s->warehouse->city} ({$s->warehouse->code})"
                : 'Casablanca (DEP-01)';

            return [
                'id' => $s->id,
                'product_id' => $s->product_id,
                'warehouse_id' => $s->warehouse_id,
                'sku' => $s->product?->sku ?? 'N/A',
                'name' => $s->product?->name ?? 'Article inconnu',
                'category' => $s->product?->category?->name ?? 'Général',
                'warehouse' => $warehouseLabel,
                'physical' => (int) $s->on_hand,
                'reserved' => (int) $s->reserved,
                'available' => (int) max(0, $s->on_hand - $s->reserved),
                'min_threshold' => (int) $s->min_threshold,
                'unit' => $s->product?->unit ?? 'Pièce',
                'unit_price' => (float) ($s->unit_price ?: ($s->product?->price ?? 0)),
                'lot_number' => $s->lot_number ?: 'N/A',
                'expiry_date' => $s->expiry_date ?: 'N/A',
                'image' => $s->product?->image,
            ];
        });

        return response()->json($stocks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'warehouse' => 'nullable|string', // e.g. "Casablanca (DEP-01)"
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'physical' => 'required|integer|min:0',
            'min_threshold' => 'nullable|integer|min:0',
            'unit' => 'nullable|string',
            'unit_price' => 'nullable|numeric|min:0',
            'lot_number' => 'nullable|string',
            'expiry_date' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // Find or determine warehouse
            $warehouseId = $validated['warehouse_id'] ?? null;
            if (!$warehouseId && !empty($validated['warehouse'])) {
                if (str_contains($validated['warehouse'], 'DEP-02') || str_contains($validated['warehouse'], 'Rabat')) {
                    $w = Warehouse::firstWhere('code', 'DEP-02');
                } else {
                    $w = Warehouse::firstWhere('code', 'DEP-01');
                }
                $warehouseId = $w?->id;
            }
            if (!$warehouseId) {
                $warehouseId = Warehouse::first()?->id ?? 1;
            }

            // Find or create product
            $sku = strtoupper(trim($validated['sku']));
            $product = Product::firstWhere('sku', $sku);

            if (!$product) {
                $categoryId = null;
                if (!empty($validated['category'])) {
                    $cat = Category::firstOrCreate(
                        ['name' => $validated['category']],
                        ['code' => strtoupper(substr($validated['category'], 0, 3))]
                    );
                    $categoryId = $cat->id;
                }

                $nextCount = Product::count() + 1;
                $code = 'PRD-' . str_pad($nextCount, 4, '0', STR_PAD_LEFT);

                $product = Product::create([
                    'code' => $code,
                    'sku' => $sku,
                    'name' => trim($validated['name']),
                    'category_id' => $categoryId,
                    'price' => (float) ($validated['unit_price'] ?? 100),
                    'purchase_price_ht' => (float) ($validated['unit_price'] ?? 80),
                    'vat_rate' => 20,
                    'packaging' => $validated['unit'] ?? 'Pièce',
                    'unit' => $validated['unit'] ?? 'Pièce',
                    'status' => 'Actif',
                    'image' => $validated['image'] ?? 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80',
                ]);
            } else if (!empty($validated['image']) && empty($product->image)) {
                $product->update(['image' => $validated['image']]);
            }

            // Create or update stock entry
            $stock = Stock::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouseId,
                ],
                [
                    'on_hand' => (int) $validated['physical'],
                    'reserved' => 0,
                    'min_threshold' => (int) ($validated['min_threshold'] ?? 10),
                    'lot_number' => $validated['lot_number'] ?: ('LOT-' . date('Y') . '-001'),
                    'expiry_date' => $validated['expiry_date'] ?: 'N/A',
                    'unit_price' => (float) ($validated['unit_price'] ?? $product->price),
                ]
            );

            $stock->load(['product.category', 'warehouse']);

            $warehouseLabel = $stock->warehouse
                ? "{$stock->warehouse->city} ({$stock->warehouse->code})"
                : 'Casablanca (DEP-01)';

            return response()->json([
                'id' => $stock->id,
                'product_id' => $stock->product_id,
                'warehouse_id' => $stock->warehouse_id,
                'sku' => $stock->product->sku,
                'name' => $stock->product->name,
                'category' => $stock->product->category?->name ?? 'Général',
                'warehouse' => $warehouseLabel,
                'physical' => (int) $stock->on_hand,
                'reserved' => (int) $stock->reserved,
                'available' => (int) max(0, $stock->on_hand - $stock->reserved),
                'min_threshold' => (int) $stock->min_threshold,
                'unit' => $stock->product->unit,
                'unit_price' => (float) $stock->unit_price,
                'lot_number' => $stock->lot_number,
                'expiry_date' => $stock->expiry_date,
                'image' => $stock->product->image,
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $stock = Stock::findOrFail($id);

        $validated = $request->validate([
            'physical' => 'sometimes|integer|min:0',
            'min_threshold' => 'sometimes|integer|min:0',
            'unit_price' => 'sometimes|numeric|min:0',
            'lot_number' => 'sometimes|nullable|string',
            'expiry_date' => 'sometimes|nullable|string',
        ]);

        $stock->update([
            'on_hand' => $validated['physical'] ?? $stock->on_hand,
            'min_threshold' => $validated['min_threshold'] ?? $stock->min_threshold,
            'unit_price' => $validated['unit_price'] ?? $stock->unit_price,
            'lot_number' => $validated['lot_number'] ?? $stock->lot_number,
            'expiry_date' => $validated['expiry_date'] ?? $stock->expiry_date,
        ]);

        return response()->json($stock);
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $fromStock = Stock::where('product_id', $validated['product_id'])
                ->where('warehouse_id', $validated['from_warehouse_id'])
                ->firstOrFail();

            if ($fromStock->on_hand < $validated['quantity']) {
                return response()->json(['message' => 'Stock insuffisant dans le dépôt source'], 422);
            }

            $fromStock->decrement('on_hand', $validated['quantity']);

            $toStock = Stock::firstOrCreate(
                [
                    'product_id' => $validated['product_id'],
                    'warehouse_id' => $validated['to_warehouse_id'],
                ],
                [
                    'on_hand' => 0,
                    'reserved' => 0,
                    'min_threshold' => 10,
                    'lot_number' => $fromStock->lot_number,
                    'unit_price' => $fromStock->unit_price,
                ]
            );

            $toStock->increment('on_hand', $validated['quantity']);

            return response()->json([
                'message' => 'Transfert inter-dépôts validé avec succès',
                'from_stock' => $fromStock->fresh(),
                'to_stock' => $toStock->fresh(),
            ]);
        });
    }
}
