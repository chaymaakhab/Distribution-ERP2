<?php

namespace App\Http\Controllers\Api\v1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function categories()
    {
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('visible_portal', true)->where('status', 'Actif');
        }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return response()->json([
            'data' => $categories->map(fn ($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
                'products_count' => $c->products_count,
            ]),
        ]);
    }

    public function products(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $query = Product::query()
            ->with(['category', 'prices', 'stocks'])
            ->where('visible_portal', true)
            ->where('status', 'Actif');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('code', $request->string('category')));
        }

        if ($request->filled('q')) {
            $term = trim($request->string('q'));
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%");
            });
        }

        $products = $query->orderBy('name')->get();

        return response()->json([
            'data' => $products->map(fn ($p) => $this->presentProduct($p, $customer, false))->values(),
        ]);
    }

    public function product(Request $request, string $code)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $product = Product::with(['category', 'prices', 'stocks'])
            ->where('visible_portal', true)
            ->where(function ($q) use ($code) {
                $q->where('code', $code)->orWhere('sku', $code)->orWhere('id', $code);
            })
            ->firstOrFail();

        return response()->json([
            'data' => $this->presentProduct($product, $customer, true),
        ]);
    }

    private function presentProduct(Product $product, Customer $customer, bool $full): array
    {
        $priceHt = $product->priceForTier($customer->price_tier);
        $vat = (int) $product->vat_rate;
        $priceTtc = round($priceHt * (1 + $vat / 100), 2);

        $available = $product->stocks->sum(fn ($s) => max(0, $s->on_hand - $s->reserved));

        $data = [
            'id' => $product->id,
            'code' => $product->code,
            'sku' => $product->sku,
            'name' => $product->name,
            'image' => $product->image,
            'category' => $product->category?->name,
            'packaging' => $product->packaging,
            'unit' => $product->unit,
            'vat_rate' => $vat,
            'price_ht' => $priceHt,
            'price_ttc' => $priceTtc,
            'min_order_qty' => (int) $product->min_order_qty,
            'available_qty' => (int) $available,
            'in_stock' => $available > 0,
        ];

        if ($full) {
            $data['description'] = $product->description;
        }

        return $data;
    }
}
