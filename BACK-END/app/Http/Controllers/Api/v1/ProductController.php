<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'prices', 'stocks.warehouse'])->orderBy('id', 'desc');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('sku', 'like', "%{$q}%")
                  ->orWhere('code', 'like', "%{$q}%");
            });
        }

        $products = $query->get()->map(function ($p) {
            $revendeurPrice = $p->priceForTier('revendeur');
            $grossistePrice = $p->priceForTier('grossiste');
            $totalStock = $p->stocks->sum('on_hand');

            return [
                'id' => $p->id,
                'code' => $p->code,
                'sku' => $p->sku,
                'name' => $p->name,
                'category' => $p->category?->name ?? 'Général',
                'category_id' => $p->category_id,
                'price_ht' => (float) $p->price,
                'purchase_price_ht' => (float) $p->purchase_price_ht,
                'vat_rate' => (int) $p->vat_rate,
                'price_revendeur' => (float) $revendeurPrice,
                'price_grossiste' => (float) $grossistePrice,
                'packaging' => $p->packaging,
                'unit' => $p->unit,
                'status' => $p->status,
                'total_stock' => $totalStock,
                'image' => $p->image,
                'barcode' => $p->barcode,
            ];
        });

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:products,sku',
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'category_name' => 'nullable|string',
            'price_ht' => 'required|numeric|min:0',
            'purchase_price_ht' => 'nullable|numeric|min:0',
            'vat_rate' => 'nullable|integer',
            'price_revendeur' => 'nullable|numeric|min:0',
            'price_grossiste' => 'nullable|numeric|min:0',
            'packaging' => 'nullable|string',
            'unit' => 'nullable|string',
            'initial_stock' => 'nullable|integer|min:0',
            'min_alert' => 'nullable|integer|min:0',
            'image' => 'nullable|string',
            'barcode' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $categoryId = $validated['category_id'] ?? null;
            if (!$categoryId && !empty($validated['category_name'])) {
                $category = Category::firstOrCreate(
                    ['name' => $validated['category_name']],
                    ['code' => strtoupper(substr($validated['category_name'], 0, 3))]
                );
                $categoryId = $category->id;
            }

            $nextCount = Product::count() + 1;
            $code = 'PRD-' . str_pad($nextCount, 4, '0', STR_PAD_LEFT);

            $product = Product::create([
                'code' => $code,
                'sku' => strtoupper(trim($validated['sku'])),
                'name' => trim($validated['name']),
                'category_id' => $categoryId,
                'price' => (float) $validated['price_ht'],
                'purchase_price_ht' => (float) ($validated['purchase_price_ht'] ?? $validated['price_ht']),
                'vat_rate' => $validated['vat_rate'] ?? 20,
                'packaging' => $validated['packaging'] ?? 'Pièce',
                'unit' => $validated['unit'] ?? 'Pièce',
                'status' => 'Actif',
                'image' => $validated['image'] ?? 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80',
                'barcode' => $validated['barcode'] ?? null,
            ]);

            // Save tier prices
            if (isset($validated['price_revendeur'])) {
                ProductPrice::create([
                    'product_id' => $product->id,
                    'tier' => 'revendeur',
                    'price' => (float) $validated['price_revendeur'],
                ]);
            }
            if (isset($validated['price_grossiste'])) {
                ProductPrice::create([
                    'product_id' => $product->id,
                    'tier' => 'grossiste',
                    'price' => (float) $validated['price_grossiste'],
                ]);
            }

            // Assign initial stock to Casa warehouse
            $initialStock = (int) ($validated['initial_stock'] ?? 50);
            $casa = Warehouse::firstWhere('code', 'DEP-01');
            if ($casa) {
                Stock::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $casa->id,
                    'on_hand' => $initialStock,
                    'reserved' => 0,
                    'min_threshold' => (int) ($validated['min_alert'] ?? 10),
                    'lot_number' => 'LOT-' . date('Y') . '-001',
                    'expiry_date' => 'N/A',
                    'unit_price' => (float) $product->price,
                ]);
            }

            return response()->json($product, 201);
        });
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'sku' => "sometimes|required|string|unique:products,sku,{$id}",
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'price_ht' => 'sometimes|required|numeric|min:0',
            'vat_rate' => 'sometimes|integer',
            'packaging' => 'sometimes|string',
            'unit' => 'sometimes|string',
            'status' => 'sometimes|string|in:Actif,Inactif',
            'image' => 'sometimes|nullable|string',
            'barcode' => 'sometimes|nullable|string',
            'price_revendeur' => 'sometimes|nullable|numeric|min:0',
            'price_grossiste' => 'sometimes|nullable|numeric|min:0',
        ]);

        $product->update([
            'sku' => $validated['sku'] ?? $product->sku,
            'name' => $validated['name'] ?? $product->name,
            'category_id' => $validated['category_id'] ?? $product->category_id,
            'price' => $validated['price_ht'] ?? $product->price,
            'vat_rate' => $validated['vat_rate'] ?? $product->vat_rate,
            'packaging' => $validated['packaging'] ?? $product->packaging,
            'unit' => $validated['unit'] ?? $product->unit,
            'status' => $validated['status'] ?? $product->status,
            'image' => $validated['image'] ?? $product->image,
            'barcode' => $validated['barcode'] ?? $product->barcode,
        ]);

        if (isset($validated['price_revendeur'])) {
            ProductPrice::updateOrCreate(
                ['product_id' => $product->id, 'tier' => 'revendeur'],
                ['price' => (float) $validated['price_revendeur']]
            );
        }
        if (isset($validated['price_grossiste'])) {
            ProductPrice::updateOrCreate(
                ['product_id' => $product->id, 'tier' => 'grossiste'],
                ['price' => (float) $validated['price_grossiste']]
            );
        }

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Article supprimé avec succès']);
    }
}
