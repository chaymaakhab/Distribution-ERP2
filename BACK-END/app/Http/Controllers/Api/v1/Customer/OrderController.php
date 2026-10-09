<?php

namespace App\Http\Controllers\Api\v1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\CommercialCommission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $orders = $customer->orders()
            ->withCount('items')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $orders->map(fn ($o) => $this->presentSummary($o))->values(),
        ]);
    }

    public function show(Request $request, string $ref)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $order = $customer->orders()
            ->with(['items.product'])
            ->where('ref', $ref)
            ->firstOrFail();

        return response()->json([
            'data' => $this->presentDetail($order),
        ]);
    }

    public function store(Request $request)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'desired_date' => ['nullable', 'date'],
            'delivery_note' => ['nullable', 'string', 'max:1000'],
            'client_generated_uuid' => ['nullable', 'string', 'max:64'],
        ]);

        // Idempotency: resubmitting the same cart returns the existing order.
        if (! empty($data['client_generated_uuid'])) {
            $existing = Order::where('client_generated_uuid', $data['client_generated_uuid'])->first();
            if ($existing) {
                return response()->json(['data' => $this->presentDetail($existing->load('items.product'))], 200);
            }
        }

        $productIds = collect($data['items'])->pluck('product_id')->all();
        $products = Product::with('prices')->whereIn('id', $productIds)->get()->keyBy('id');

        $order = DB::transaction(function () use ($customer, $data, $products) {
            $total = 0.0;
            $lines = [];

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                if (! $product || $product->status !== 'Actif' || ! $product->visible_portal) {
                    continue;
                }

                $qty = max((int) $product->min_order_qty, (int) $item['quantity']);
                $unitPrice = $product->priceForTier($customer->price_tier);
                $lineTotal = round($unitPrice * $qty, 2);
                $total += $lineTotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total' => $lineTotal,
                ];
            }

            if (empty($lines)) {
                abort(response()->json(['message' => 'Aucun produit valide dans la commande.'], 422));
            }

            $order = Order::create([
                'ref' => 'CMD-'.Str::upper(Str::random(6)),
                'customer_id' => $customer->id,
                'commercial_id' => $customer->commercial_id,
                'city' => $customer->city,
                'date' => now()->toDateString(),
                'desired_date' => $data['desired_date'] ?? null,
                'delivery_note' => $data['delivery_note'] ?? null,
                'total' => round($total, 2),
                'discount' => 0,
                'status' => 'pending_validation',
                'source' => 'Portail client',
                'client_generated_uuid' => $data['client_generated_uuid'] ?? null,
            ]);

            $order->items()->createMany($lines);

            if ($customer->commercial_id) {
                $commRate = (float) ($customer->commission_percentage ?? 5.00);
                $finalTotal = round($total, 2);
                $commAmount = round(($finalTotal * $commRate) / 100, 2);
                CommercialCommission::create([
                    'company_id' => $customer->company_id,
                    'commercial_id' => $customer->commercial_id,
                    'customer_id' => $customer->id,
                    'order_id' => $order->id,
                    'commercial_reference' => $customer->commercial_reference,
                    'base_amount' => $finalTotal,
                    'commission_rate' => $commRate,
                    'commission_amount' => $commAmount,
                    'status' => 'pending',
                    'period' => now()->format('Y-m'),
                ]);
            }

            return $order;
        });

        return response()->json([
            'data' => $this->presentDetail($order->load('items.product')),
            'message' => 'Commande transmise. Elle est en attente de validation.',
        ], 201);
    }

    /**
     * Return the still-available lines of a past order so the customer can
     * re-add them to the cart in one click ("commandes habituelles").
     */
    public function reorder(Request $request, string $ref)
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $order = $customer->orders()->with('items.product.stocks')->where('ref', $ref)->firstOrFail();

        $items = $order->items->map(function ($item) use ($customer) {
            $product = $item->product;
            if (! $product || $product->status !== 'Actif' || ! $product->visible_portal) {
                return null;
            }
            $available = $product->stocks->sum(fn ($s) => max(0, $s->on_hand - $s->reserved));

            return [
                'product_id' => $product->id,
                'code' => $product->code,
                'name' => $product->name,
                'image' => $product->image,
                'unit' => $product->unit,
                'vat_rate' => (int) $product->vat_rate,
                'quantity' => $item->quantity,
                'price_ht' => $product->priceForTier($customer->price_tier),
                'available_qty' => (int) $available,
                'in_stock' => $available > 0,
            ];
        })->filter()->values();

        return response()->json(['data' => $items]);
    }

    private function presentSummary(Order $order): array
    {
        return [
            'ref' => $order->ref,
            'date' => $order->date,
            'status' => $order->status,
            'status_label' => self::statusLabel($order->status),
            'total' => (float) $order->total,
            'items_count' => $order->items_count ?? $order->items->count(),
        ];
    }

    private function presentDetail(Order $order): array
    {
        return [
            'ref' => $order->ref,
            'date' => $order->date,
            'desired_date' => $order->desired_date,
            'delivery_note' => $order->delivery_note,
            'status' => $order->status,
            'status_label' => self::statusLabel($order->status),
            'total' => (float) $order->total,
            'discount' => (float) $order->discount,
            'items' => $order->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'code' => $item->product?->code,
                'name' => $item->product?->name,
                'image' => $item->product?->image,
                'unit' => $item->product?->unit,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ])->values(),
        ];
    }

    public static function statusLabel(string $status): string
    {
        return [
            'pending_validation' => 'En attente de validation',
            'confirmed' => 'Confirmée',
            'prepared' => 'Préparée',
            'assigned' => 'Affectée',
            'in_delivery' => 'En livraison',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
            'returned' => 'Retournée',
        ][$status] ?? $status;
    }
}
