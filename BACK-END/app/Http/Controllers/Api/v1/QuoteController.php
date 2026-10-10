<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Quote::with(['customer', 'commercial', 'items.product']);

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('commercial_id')) {
            $query->where('commercial_id', $request->input('commercial_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('ref', 'like', "%{$q}%")
                    ->orWhereHas('customer', function ($cQuery) use ($q) {
                        $cQuery->where('name', 'like', "%{$q}%")
                               ->orWhere('company', 'like', "%{$q}%")
                               ->orWhere('code', 'like', "%{$q}%");
                    });
            });
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $quote = Quote::with(['customer', 'commercial', 'items.product'])->findOrFail($id);
        return response()->json($quote);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'nullable|string|unique:quotes,ref',
            'customer_id' => 'required|exists:customers,id',
            'commercial_id' => 'nullable|exists:users,id',
            'date' => 'required|date',
            'valid_until' => 'nullable|date',
            'status' => 'nullable|string|in:Brouillon,Envoyé,Accepté,Converti,Refusé',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $ref = $validated['ref'] ?? ('DEV-' . date('Y') . '-' . str_pad((string) (Quote::count() + 1), 3, '0', STR_PAD_LEFT));

            $totalHt = 0;
            foreach ($validated['items'] as $item) {
                $totalHt += $item['quantity'] * $item['unit_price'];
            }
            $totalTva = round($totalHt * 0.20, 2);
            $totalTtc = round($totalHt + $totalTva, 2);

            $quote = Quote::create([
                'ref' => $ref,
                'customer_id' => $validated['customer_id'],
                'commercial_id' => $validated['commercial_id'] ?? $request->user()?->id,
                'date' => $validated['date'],
                'valid_until' => $validated['valid_until'] ?? now()->addDays(30)->toDateString(),
                'total_ht' => $totalHt,
                'total_tva' => $totalTva,
                'total_ttc' => $totalTtc,
                'status' => $validated['status'] ?? 'Brouillon',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                QuoteItem::create([
                    'quote_id' => $quote->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => round($item['quantity'] * $item['unit_price'], 2),
                ]);
            }

            return response()->json($quote->load(['customer', 'commercial', 'items.product']), 201);
        });
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $quote = Quote::findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'valid_until' => 'nullable|date',
            'status' => 'sometimes|string',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        return DB::transaction(function () use ($quote, $validated) {
            $quote->update([
                'date' => $validated['date'] ?? $quote->date,
                'valid_until' => $validated['valid_until'] ?? $quote->valid_until,
                'status' => $validated['status'] ?? $quote->status,
                'notes' => $validated['notes'] ?? $quote->notes,
            ]);

            if (isset($validated['items'])) {
                $quote->items()->delete();
                $totalHt = 0;
                foreach ($validated['items'] as $item) {
                    $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                    $totalHt += $lineTotal;

                    QuoteItem::create([
                        'quote_id' => $quote->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total' => $lineTotal,
                    ]);
                }
                $totalTva = round($totalHt * 0.20, 2);
                $totalTtc = round($totalHt + $totalTva, 2);

                $quote->update([
                    'total_ht' => $totalHt,
                    'total_tva' => $totalTva,
                    'total_ttc' => $totalTtc,
                ]);
            }

            return response()->json($quote->load(['customer', 'commercial', 'items.product']));
        });
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Brouillon,Envoyé,Accepté,Converti,Refusé',
        ]);

        $quote = Quote::findOrFail($id);
        $quote->update(['status' => $validated['status']]);

        return response()->json($quote);
    }

    public function convertToOrder(Request $request, int $id): JsonResponse
    {
        $quote = Quote::with(['customer', 'items.product'])->findOrFail($id);

        return DB::transaction(function () use ($quote, $request) {
            $orderRef = 'CMD-' . (Order::count() + 2408);

            $order = Order::create([
                'ref' => $orderRef,
                'customer_id' => $quote->customer_id,
                'warehouse_id' => $request->user()?->warehouse_id,
                'commercial_id' => $quote->commercial_id ?? $request->user()?->id,
                'city' => $quote->customer?->city ?? 'Casablanca',
                'date' => now()->format('d M Y'),
                'total' => $quote->total_ttc,
                'status' => 'confirmed',
                'source' => 'Devis ' . $quote->ref,
            ]);

            foreach ($quote->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                ]);
            }

            $quote->update(['status' => 'Converti']);

            return response()->json([
                'message' => 'Devis converti en commande avec succès',
                'order' => $order->load(['customer', 'items.product']),
                'quote' => $quote,
            ], 201);
        });
    }
}
