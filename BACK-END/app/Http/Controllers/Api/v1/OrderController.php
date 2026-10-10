<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\CommercialCommission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['customer:id,code,name,company,city,ice', 'items.product:id,code,sku,name,price'])
            ->withCount('items')
            ->orderBy('id', 'desc');

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('ref', 'like', "%{$q}%")
                  ->orWhere('city', 'like', "%{$q}%")
                  ->orWhereHas('customer', function ($c) use ($q) {
                      $c->where('name', 'like', "%{$q}%")
                        ->orWhere('company', 'like', "%{$q}%");
                  });
            });
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $orders = $query->get()->map(function ($o) {
            $customerName = $o->customer?->company ?: ($o->customer?->name ?? 'Client comptoir');

            return [
                'id' => $o->id,
                'ref' => $o->ref,
                'customer' => $customerName,
                'customer_id' => $o->customer_id,
                'city' => $o->city,
                'date' => $o->date,
                'total' => (float) $o->total,
                'status' => $o->status,
                'source' => $o->source ?? 'Commercial',
                'items_count' => (int) $o->items_count,
                'items' => $o->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'product_id' => $it->product_id,
                        'sku' => $it->product?->sku ?? 'N/A',
                        'name' => $it->product?->name ?? 'Article',
                        'quantity' => (int) $it->quantity,
                        'unit_price' => (float) $it->unit_price,
                        'total' => (float) $it->total,
                    ];
                }),
            ];
        });

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ref' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id',
            'customer' => 'nullable|string',
            'city' => 'required|string',
            'date' => 'nullable|string',
            'total' => 'nullable|numeric',
            'status' => 'nullable|string',
            'source' => 'nullable|string',
            'items' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $customerId = $validated['customer_id'] ?? null;
            if (!$customerId && !empty($validated['customer'])) {
                $c = Customer::where('company', $validated['customer'])
                    ->orWhere('name', $validated['customer'])
                    ->first();
                $customerId = $c?->id;
            }
            if (!$customerId) {
                $customerId = Customer::first()?->id ?? 1;
            }

            $customer = Customer::find($customerId);

            $nextCount = Order::count() + 2407;
            $ref = $validated['ref'] ?? ('CMD-' . $nextCount);

            $date = $validated['date'] ?? date('d M Y');
            $status = $validated['status'] ?? 'À valider';
            $source = $validated['source'] ?? 'Commercial';

            $total = (float) ($validated['total'] ?? 0);

            $order = Order::create([
                'ref' => $ref,
                'customer_id' => $customerId,
                'warehouse_id' => $request->user()?->warehouse_id,
                'commercial_id' => $customer?->commercial_id ?? $request->user()?->id,
                'city' => $validated['city'],
                'date' => $date,
                'total' => $total,
                'discount' => 0,
                'status' => $status,
                'source' => $source,
            ]);

            if (!empty($validated['items'])) {
                $calcTotal = 0;
                foreach ($validated['items'] as $item) {
                    $qty = (int) ($item['quantity'] ?? 1);
                    $price = (float) ($item['unit_price'] ?? 0);
                    $lineTotal = round($qty * $price, 2);
                    $calcTotal += $lineTotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $qty,
                        'unit_price' => $price,
                        'total' => $lineTotal,
                    ]);
                }
                if ($total <= 0) {
                    $order->update(['total' => $calcTotal]);
                }
            }

            // Record Commercial Commission if customer has commercial attribution
            $commId = $order->commercial_id;
            if ($commId && $customer) {
                $commRate = (float) ($customer->commission_percentage ?? 5.00);
                $finalTotal = (float) $order->fresh()->total;
                $commAmount = round(($finalTotal * $commRate) / 100, 2);
                CommercialCommission::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'company_id' => $customer->company_id,
                        'commercial_id' => $commId,
                        'customer_id' => $customer->id,
                        'commercial_reference' => $customer->commercial_reference,
                        'base_amount' => $finalTotal,
                        'commission_rate' => $commRate,
                        'commission_amount' => $commAmount,
                        'status' => 'pending',
                        'period' => now()->format('Y-m'),
                    ]
                );
            }

            $order->load(['customer', 'items.product']);

            return response()->json($order, 201);
        });
    }

    public function show($id)
    {
        $order = Order::with([
            'customer',
            'warehouse',
            'commercial',
            'items.product',
            'invoice',
            'deliverySlip',
        ])
        ->where('id', $id)
        ->orWhere('ref', $id)
        ->firstOrFail();

        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        $order = Order::where('id', $id)->orWhere('ref', $id)->firstOrFail();

        $validated = $request->validate([
            'city' => 'sometimes|string',
            'status' => 'sometimes|string',
            'source' => 'sometimes|string',
            'total' => 'sometimes|numeric',
        ]);

        $order->update($validated);

        return response()->json($order);
    }

    public function updateStatus(Request $request, $ref)
    {
        $request->validate(['status' => 'required|string']);
        $order = Order::where('ref', $ref)->orWhere('id', $ref)->firstOrFail();
        $order->status = $request->input('status');
        $order->save();

        return response()->json($order);
    }

    public function generateDeliverySlip($id)
    {
        $order = Order::with(['customer', 'items.product'])->where('id', $id)->orWhere('ref', $id)->firstOrFail();

        return DB::transaction(function () use ($order) {
            $existing = \App\Models\DeliverySlip::where('order_id', $order->id)->first();
            if ($existing) {
                return response()->json($existing->load(['customer', 'items.product']));
            }

            $blRef = 'BL-' . date('Y') . '-' . str_pad((string) (\App\Models\DeliverySlip::count() + 1), 3, '0', STR_PAD_LEFT);
            $totalHt = round($order->total / 1.2, 2);
            $totalTva = round($order->total - $totalHt, 2);

            $slip = \App\Models\DeliverySlip::create([
                'ref' => $blRef,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'warehouse_id' => $order->warehouse_id,
                'delivery_date' => now()->toDateString(),
                'total_ht' => $totalHt,
                'total_tva' => $totalTva,
                'total_ttc' => $order->total,
                'status' => 'valide',
            ]);

            foreach ($order->items as $item) {
                \App\Models\DeliverySlipItem::create([
                    'delivery_slip_id' => $slip->id,
                    'product_id' => $item->product_id,
                    'quantity_ordered' => $item->quantity,
                    'quantity_delivered' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                ]);
            }

            return response()->json($slip->load(['customer', 'items.product']), 201);
        });
    }

    public function generateInvoice($id)
    {
        $order = Order::with(['customer', 'items.product'])->where('id', $id)->orWhere('ref', $id)->firstOrFail();

        return DB::transaction(function () use ($order) {
            $existing = \App\Models\Invoice::where('order_id', $order->id)->first();
            if ($existing) {
                return response()->json($existing->load(['customer', 'items.product']));
            }

            $invRef = 'FAC-' . date('Y') . '-' . str_pad((string) (\App\Models\Invoice::count() + 1), 4, '0', STR_PAD_LEFT);
            $totalHt = round($order->total / 1.2, 2);
            $totalTva = round($order->total - $totalHt, 2);

            $invoice = \App\Models\Invoice::create([
                'ref' => $invRef,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'warehouse_id' => $order->warehouse_id,
                'total_ht' => $totalHt,
                'tva_rate' => 20.00,
                'tva_amount' => $totalTva,
                'total_ttc' => $order->total,
                'paid_amount' => 0.00,
                'status' => 'Impayée',
                'due_date' => now()->addDays(30)->toDateString(),
            ]);

            foreach ($order->items as $item) {
                \App\Models\InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_ht' => round($item->quantity * ($item->unit_price / 1.2), 2),
                    'tva_rate' => 20.00,
                    'total_ttc' => $item->total,
                ]);
            }

            return response()->json($invoice->load(['customer', 'items.product']), 201);
        });
    }

    public function destroy($id)
    {
        $order = Order::where('id', $id)->orWhere('ref', $id)->firstOrFail();
        $order->delete();

        return response()->json(['message' => 'Commande supprimée avec succès']);
    }
}
