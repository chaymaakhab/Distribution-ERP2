<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\DeliverySlip;
use App\Models\DeliverySlipItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliverySlipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DeliverySlip::with([
            'order',
            'customer',
            'warehouse',
            'driver',
            'items.product',
        ]);

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->input('driver_id'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('ref', 'like', "%{$q}%")
                    ->orWhereHas('customer', function ($cQuery) use ($q) {
                        $cQuery->where('name', 'like', "%{$q}%")
                               ->orWhere('company', 'like', "%{$q}%")
                               ->orWhere('city', 'like', "%{$q}%");
                    })
                    ->orWhereHas('order', function ($oQuery) use ($q) {
                        $oQuery->where('ref', 'like', "%{$q}%");
                    });
            });
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $slip = DeliverySlip::with([
            'order.items.product',
            'customer',
            'warehouse',
            'driver',
            'items.product',
        ])->findOrFail($id);

        return response()->json($slip);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ref' => 'nullable|string|unique:delivery_slips,ref',
            'order_id' => 'nullable|exists:orders,id',
            'customer_id' => 'required|exists:customers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'delivery_date' => 'required|date',
            'total_ht' => 'nullable|numeric|min:0',
            'total_tva' => 'nullable|numeric|min:0',
            'total_ttc' => 'nullable|numeric|min:0',
            'status' => 'nullable|string',
            'receiver_name' => 'nullable|string',
            'signature' => 'nullable|string',
            'notes' => 'nullable|string',
            'lines' => 'nullable|array',
            'lines.*.product_id' => 'required_with:lines|exists:products,id',
            'lines.*.quantity_ordered' => 'required_with:lines|integer|min:1',
            'lines.*.quantity_delivered' => 'required_with:lines|integer|min:0',
            'lines.*.unit_price' => 'nullable|numeric|min:0',
            'lines.*.total' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $ref = $validated['ref'] ?? ('BL-' . date('Y') . '-' . str_pad((string) (DeliverySlip::count() + 1), 3, '0', STR_PAD_LEFT));

            // If generated from order and lines not provided, populate from order
            $order = !empty($validated['order_id']) ? Order::with('items')->find($validated['order_id']) : null;

            $totalHt = $validated['total_ht'] ?? ($order ? round($order->total / 1.2, 2) : 0);
            $totalTva = $validated['total_tva'] ?? ($order ? round($order->total - ($order->total / 1.2), 2) : 0);
            $totalTtc = $validated['total_ttc'] ?? ($order ? $order->total : 0);

            $slip = DeliverySlip::create([
                'ref' => $ref,
                'order_id' => $validated['order_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'warehouse_id' => $validated['warehouse_id'] ?? $order?->warehouse_id,
                'driver_id' => $validated['driver_id'] ?? null,
                'delivery_date' => $validated['delivery_date'],
                'total_ht' => $totalHt,
                'total_tva' => $totalTva,
                'total_ttc' => $totalTtc,
                'status' => $validated['status'] ?? 'valide',
                'receiver_name' => $validated['receiver_name'] ?? null,
                'signature' => $validated['signature'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['lines'])) {
                foreach ($validated['lines'] as $line) {
                    DeliverySlipItem::create([
                        'delivery_slip_id' => $slip->id,
                        'product_id' => $line['product_id'],
                        'quantity_ordered' => $line['quantity_ordered'],
                        'quantity_delivered' => $line['quantity_delivered'] ?? $line['quantity_ordered'],
                        'unit_price' => $line['unit_price'] ?? 0.00,
                        'total' => $line['total'] ?? (($line['quantity_delivered'] ?? $line['quantity_ordered']) * ($line['unit_price'] ?? 0)),
                    ]);
                }
            } elseif ($order && $order->items->isNotEmpty()) {
                foreach ($order->items as $item) {
                    DeliverySlipItem::create([
                        'delivery_slip_id' => $slip->id,
                        'product_id' => $item->product_id,
                        'quantity_ordered' => $item->quantity,
                        'quantity_delivered' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total' => $item->total,
                    ]);
                }
            }

            return response()->json($slip->load(['customer', 'warehouse', 'driver', 'items.product', 'order']), 201);
        });
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:brouillon,valide,en_cours,livre,refuse',
        ]);

        $slip = DeliverySlip::findOrFail($id);
        $slip->update(['status' => $validated['status']]);

        return response()->json($slip);
    }

    public function sign(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'receiver_name' => 'required|string',
            'signature' => 'required|string',
        ]);

        $slip = DeliverySlip::findOrFail($id);
        $slip->update([
            'receiver_name' => $validated['receiver_name'],
            'signature' => $validated['signature'],
            'status' => 'livre',
        ]);

        if ($slip->order_id) {
            Order::where('id', $slip->order_id)->update(['status' => 'Livré']);
        }

        return response()->json($slip);
    }
}
