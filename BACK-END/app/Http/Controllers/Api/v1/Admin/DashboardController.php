<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CommercialCommission;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Order statuses that count towards revenue (a draft/pending order is not
     * yet a sale; cancelled and returned orders are excluded).
     */
    private const REVENUE_STATUSES = ['confirmed', 'prepared', 'assigned', 'in_delivery', 'delivered'];

    /**
     * Headline KPIs for the SuperAdmin / Administrateur dashboard.
     */
    public function overview()
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        $revenue = fn () => Order::whereIn('status', self::REVENUE_STATUSES);

        $caToday = (float) $revenue()->where('date', $today)->sum('total');
        $caMonth = (float) $revenue()->whereBetween('date', [$monthStart, $today])->sum('total');
        $caPrevMonth = (float) $revenue()
            ->whereBetween('date', [
                now()->subMonthNoOverflow()->startOfMonth()->toDateString(),
                now()->subMonthNoOverflow()->endOfMonth()->toDateString(),
            ])
            ->sum('total');

        // Stock health, computed per product across all warehouses.
        $stockRows = Stock::selectRaw('product_id, SUM(on_hand) as on_hand, SUM(reserved) as reserved, SUM(min_threshold) as min_threshold')
            ->groupBy('product_id')
            ->get();

        $ruptures = 0;
        $lowStock = 0;
        foreach ($stockRows as $row) {
            $available = (int) $row->on_hand - (int) $row->reserved;
            if ($available <= 0) {
                $ruptures++;
            } elseif ($available <= (int) $row->min_threshold) {
                $lowStock++;
            }
        }

        $receivables = (float) Invoice::whereColumn('paid_amount', '<', 'total_ttc')
            ->sum(DB::raw('total_ttc - paid_amount'));

        return response()->json([
            'data' => [
                'ca_today' => round($caToday, 2),
                'ca_month' => round($caMonth, 2),
                'ca_prev_month' => round($caPrevMonth, 2),
                'ca_month_delta' => $caPrevMonth > 0 ? round((($caMonth - $caPrevMonth) / $caPrevMonth) * 100, 1) : null,

                'orders_total' => Order::count(),
                'orders_today' => Order::where('date', $today)->count(),
                'orders_to_validate' => Order::where('status', 'pending_validation')->count(),
                'orders_in_delivery' => Order::where('status', 'in_delivery')->count(),

                'deliveries_in_progress' => Delivery::whereNotIn('status', ['Livrée', 'Annulée', 'Échec'])->count(),
                'deliveries_done' => Delivery::where('status', 'Livrée')->count(),

                'payments_total' => round((float) Payment::sum('amount'), 2),
                'payments_today' => round((float) Payment::whereDate('created_at', $today)->sum('amount'), 2),

                'receivables' => round($receivables, 2),
                'unpaid_invoices' => Invoice::whereColumn('paid_amount', '<', 'total_ttc')->count(),

                'returns' => Order::where('status', 'returned')->count(),

                'stock_ruptures' => $ruptures,
                'stock_low' => $lowStock,

                'customers_count' => Customer::count(),
                'products_count' => Product::count(),
                'warehouses_count' => Warehouse::count(),
            ],
        ]);
    }

    /**
     * Chart data: revenue time series and breakdowns.
     */
    public function revenue()
    {
        return response()->json([
            'data' => [
                'by_day' => $this->seriesByDay(30),
                'by_month' => $this->seriesByMonth(12),
                'by_warehouse' => $this->breakdownByWarehouse(),
                'by_city' => $this->breakdownByCity(),
                'by_commercial' => $this->breakdownByCommercial(),
                'top_products' => $this->topProducts(8),
                'orders_evolution' => $this->ordersEvolution(30),
            ],
        ]);
    }

    /**
     * Every warehouse with the data needed to plot and inspect it on the map.
     */
    public function warehouses()
    {
        $warehouses = Warehouse::orderBy('name')->get();

        $data = $warehouses->map(function (Warehouse $w) {
            $stock = Stock::where('warehouse_id', $w->id)
                ->selectRaw('COALESCE(SUM(on_hand),0) as on_hand, COALESCE(SUM(on_hand - reserved),0) as available')
                ->first();

            $productsCount = Stock::where('warehouse_id', $w->id)
                ->where('on_hand', '>', 0)
                ->distinct()
                ->count('product_id');

            $revenue = (float) Order::where('warehouse_id', $w->id)
                ->whereIn('status', self::REVENUE_STATUSES)
                ->sum('total');

            return [
                'id' => $w->id,
                'code' => $w->code,
                'name' => $w->name,
                'city' => $w->city,
                'address' => $w->address,
                'lat' => $w->lat !== null ? (float) $w->lat : null,
                'lng' => $w->lng !== null ? (float) $w->lng : null,
                'phone' => $w->phone,
                'manager_name' => $w->manager_name,
                'status' => $w->status,
                'stock_on_hand' => (int) ($stock->on_hand ?? 0),
                'stock_available' => (int) ($stock->available ?? 0),
                'products_count' => $productsCount,
                'revenue' => round($revenue, 2),
                'orders_pending' => Order::where('warehouse_id', $w->id)
                    ->whereIn('status', ['pending_validation', 'confirmed', 'prepared'])->count(),
                'orders_in_progress' => Order::where('warehouse_id', $w->id)
                    ->whereIn('status', ['assigned', 'in_delivery'])->count(),
                'orders_done' => Order::where('warehouse_id', $w->id)->where('status', 'delivered')->count(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Ranking tables: commercials, warehouses and drivers.
     */
    public function performance()
    {
        $commercials = Order::select('commercial_id', DB::raw('COUNT(*) as orders_count'), DB::raw('SUM(total) as revenue'))
            ->whereNotNull('commercial_id')
            ->whereIn('status', self::REVENUE_STATUSES)
            ->groupBy('commercial_id')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($row) {
                $user = \App\Models\User::find($row->commercial_id);

                return [
                    'id' => $row->commercial_id,
                    'name' => $user?->name ?? 'Non attribué',
                    'orders_count' => (int) $row->orders_count,
                    'revenue' => round((float) $row->revenue, 2),
                    'customers_count' => Customer::where('commercial_id', $row->commercial_id)->count(),
                ];
            });

        $warehouses = Order::select('warehouse_id', DB::raw('COUNT(*) as orders_count'), DB::raw('SUM(total) as revenue'))
            ->whereNotNull('warehouse_id')
            ->whereIn('status', self::REVENUE_STATUSES)
            ->groupBy('warehouse_id')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($row) {
                $w = Warehouse::find($row->warehouse_id);
                $available = (int) Stock::where('warehouse_id', $row->warehouse_id)
                    ->selectRaw('COALESCE(SUM(on_hand - reserved), 0) as available')
                    ->value('available');

                return [
                    'id' => $row->warehouse_id,
                    'name' => $w?->name ?? '—',
                    'city' => $w?->city,
                    'orders_count' => (int) $row->orders_count,
                    'revenue' => round((float) $row->revenue, 2),
                    'stock_available' => $available,
                ];
            });

        $drivers = Delivery::select('driver_name', DB::raw('COUNT(*) as deliveries_count'), DB::raw('SUM(amount) as amount'))
            ->groupBy('driver_name')
            ->orderByDesc('deliveries_count')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->driver_name,
                'deliveries_count' => (int) $row->deliveries_count,
                'delivered' => Delivery::where('driver_name', $row->driver_name)->where('status', 'Livrée')->count(),
                'amount' => round((float) $row->amount, 2),
            ]);

        return response()->json([
            'data' => [
                'commercials' => $commercials->values(),
                'warehouses' => $warehouses->values(),
                'drivers' => $drivers->values(),
            ],
        ]);
    }

    // ---------------------------------------------------------------------
    // Chart helpers
    // ---------------------------------------------------------------------

    private function seriesByDay(int $days): array
    {
        $start = now()->subDays($days - 1)->toDateString();

        $rows = Order::whereIn('status', self::REVENUE_STATUSES)
            ->where('date', '>=', $start)
            ->select('date', DB::raw('SUM(total) as total'))
            ->groupBy('date')
            ->pluck('total', 'date');

        $out = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $day = now()->subDays($i)->toDateString();
            $out[] = ['label' => $day, 'value' => round((float) ($rows[$day] ?? 0), 2)];
        }

        return $out;
    }

    private function seriesByMonth(int $months): array
    {
        $rows = Order::whereIn('status', self::REVENUE_STATUSES)
            ->selectRaw('LEFT(`date`, 7) as month, SUM(total) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        $out = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonthsNoOverflow($i)->format('Y-m');
            $out[] = ['label' => $month, 'value' => round((float) ($rows[$month] ?? 0), 2)];
        }

        return $out;
    }

    private function breakdownByWarehouse(): array
    {
        return Order::whereIn('orders.status', self::REVENUE_STATUSES)
            ->whereNotNull('orders.warehouse_id')
            ->join('warehouses', 'warehouses.id', '=', 'orders.warehouse_id')
            ->select('warehouses.name as label', DB::raw('SUM(orders.total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('warehouses.id', 'warehouses.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'value' => round((float) $r->total, 2), 'count' => (int) $r->count])
            ->values()
            ->all();
    }

    private function breakdownByCity(): array
    {
        return Order::whereIn('status', self::REVENUE_STATUSES)
            ->select('city as label', DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('city')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'value' => round((float) $r->total, 2), 'count' => (int) $r->count])
            ->values()
            ->all();
    }

    private function breakdownByCommercial(): array
    {
        return Order::whereIn('orders.status', self::REVENUE_STATUSES)
            ->whereNotNull('orders.commercial_id')
            ->join('users', 'users.id', '=', 'orders.commercial_id')
            ->select('users.name as label', DB::raw('SUM(orders.total) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'value' => round((float) $r->total, 2), 'count' => (int) $r->count])
            ->values()
            ->all();
    }

    private function topProducts(int $limit): array
    {
        return OrderItem::join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('orders.status', self::REVENUE_STATUSES)
            ->select('products.name as label', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.total) as total'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'value' => round((float) $r->total, 2), 'qty' => (int) $r->qty])
            ->values()
            ->all();
    }

    private function ordersEvolution(int $days): array
    {
        $start = now()->subDays($days - 1)->toDateString();

        $rows = Order::where('date', '>=', $start)
            ->select('date', DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date');

        $out = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $day = now()->subDays($i)->toDateString();
            $out[] = ['label' => $day, 'value' => (int) ($rows[$day] ?? 0)];
        }

        return $out;
    }

    /**
     * List of all commercials with their associated clients, revenue, and commissions.
     * Accessible by SuperAdmin and Administrateur.
     */
    public function commercialsClients(Request $request)
    {
        $commercialUsers = User::whereHas('roles', function ($q) {
            $q->whereIn('code', ['commercial', 'pre_seller']);
        })
        ->with(['customers' => function ($q) {
            $q->withCount('orders')
              ->withSum(['orders' => function ($oq) {
                  $oq->whereIn('status', ['confirmed', 'prepared', 'assigned', 'in_delivery', 'delivered']);
              }], 'total')
              ->orderBy('id', 'desc');
        }])
        ->get();

        $result = $commercialUsers->map(function ($commercial) {
            $clients = $commercial->customers->map(function ($customer) {
                $turnover = (float) ($customer->orders_sum_total ?? 0);
                $commPercent = (float) ($customer->commission_percentage ?? $commercial->commission_rate ?? 5.00);
                $commissionEarned = round(($turnover * $commPercent) / 100, 2);

                return [
                    'id' => $customer->id,
                    'code' => $customer->code,
                    'name' => $customer->name,
                    'company' => $customer->company,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'city' => $customer->city,
                    'ice' => $customer->ice,
                    'price_tier' => $customer->price_tier,
                    'status' => $customer->status,
                    'credit_limit' => (float) $customer->credit_limit,
                    'current_balance' => (float) $customer->current_balance,
                    'orders_count' => (int) $customer->orders_count,
                    'turnover' => $turnover,
                    'commission_percentage' => $commPercent,
                    'commission_earned' => $commissionEarned,
                    'commercial_reference' => $customer->commercial_reference,
                    'created_at' => $customer->created_at?->format('d/m/Y'),
                ];
            });

            $totalTurnover = $clients->sum('turnover');
            $totalCommission = $clients->sum('commission_earned');
            $totalOrders = $clients->sum('orders_count');

            return [
                'id' => $commercial->id,
                'name' => $commercial->name,
                'email' => $commercial->email,
                'phone' => $commercial->phone,
                'commercial_code' => $commercial->commercial_code ?: ('COM-' . str_pad($commercial->id, 3, '0', STR_PAD_LEFT)),
                'commission_rate' => (float) ($commercial->commission_rate ?? 5.00),
                'clients_count' => $clients->count(),
                'total_orders' => $totalOrders,
                'total_turnover' => round($totalTurnover, 2),
                'total_commission' => round($totalCommission, 2),
                'clients' => $clients->values()->all(),
            ];
        });

        // Clients not yet assigned to any commercial
        $unassignedClients = Customer::whereNull('commercial_id')
            ->withCount('orders')
            ->withSum(['orders' => function ($oq) {
                $oq->whereIn('status', ['confirmed', 'prepared', 'assigned', 'in_delivery', 'delivered']);
            }], 'total')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'code' => $c->code,
                    'name' => $c->name,
                    'company' => $c->company,
                    'email' => $c->email,
                    'phone' => $c->phone,
                    'city' => $c->city,
                    'price_tier' => $c->price_tier,
                    'status' => $c->status,
                    'orders_count' => (int) $c->orders_count,
                    'turnover' => (float) ($c->orders_sum_total ?? 0),
                    'created_at' => $c->created_at?->format('d/m/Y'),
                ];
            });

        // Summary metrics
        $summary = [
            'total_commercials' => $result->count(),
            'total_assigned_clients' => $result->sum('clients_count'),
            'total_unassigned_clients' => $unassignedClients->count(),
            'total_turnover' => round($result->sum('total_turnover'), 2),
            'total_commissions' => round($result->sum('total_commission'), 2),
        ];

        return response()->json([
            'summary' => $summary,
            'commercials' => $result->values()->all(),
            'unassigned_clients' => $unassignedClients->values()->all(),
        ]);
    }

    public function updateCommercialCommission(Request $request, $id)
    {
        $commercial = User::findOrFail($id);

        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100',
            'commercial_code' => "nullable|string|max:30|unique:users,commercial_code,{$id}",
        ]);

        $commercial->update($validated);

        return response()->json([
            'message' => 'Taux de commission et code commercial mis à jour.',
            'commercial' => [
                'id' => $commercial->id,
                'name' => $commercial->name,
                'commercial_code' => $commercial->commercial_code,
                'commission_rate' => (float) $commercial->commission_rate,
            ],
        ]);
    }

    /**
     * Detailed commercial commissions log table.
     */
    public function commercialCommissions(Request $request)
    {
        $query = CommercialCommission::with(['commercial:id,name,email,commercial_code,commission_rate', 'customer:id,code,name,company,city,phone', 'order:id,ref,total,status,date'])
            ->orderBy('id', 'desc');

        if ($request->filled('commercial_id')) {
            $query->where('commercial_id', $request->commercial_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        $commissions = $query->get()->map(function ($c) {
            return [
                'id' => $c->id,
                'commercial_id' => $c->commercial_id,
                'commercial_name' => $c->commercial?->name ?? 'Commercial',
                'commercial_code' => $c->commercial_reference ?: ($c->commercial?->commercial_code ?? 'COM-001'),
                'customer_id' => $c->customer_id,
                'customer_name' => $c->customer?->name ?? 'Client',
                'customer_company' => $c->customer?->company ?? ($c->customer?->name ?? 'Client'),
                'customer_city' => $c->customer?->city,
                'order_id' => $c->order_id,
                'order_ref' => $c->order?->ref ?? ('CMD-' . $c->order_id),
                'order_date' => $c->order?->date,
                'order_status' => $c->order?->status,
                'base_amount' => (float) $c->base_amount,
                'commission_rate' => (float) $c->commission_rate,
                'commission_amount' => (float) $c->commission_amount,
                'status' => $c->status,
                'period' => $c->period,
                'paid_at' => $c->paid_at?->format('d/m/Y H:i'),
                'notes' => $c->notes,
                'created_at' => $c->created_at?->format('d/m/Y'),
            ];
        });

        $totalCommissions = round($commissions->sum('commission_amount'), 2);
        $paidCommissions = round($commissions->where('status', 'paid')->sum('commission_amount'), 2);
        $pendingCommissions = round($commissions->where('status', 'pending')->sum('commission_amount'), 2);
        $validatedCommissions = round($commissions->where('status', 'validated')->sum('commission_amount'), 2);

        return response()->json([
            'summary' => [
                'total_commissions' => $totalCommissions,
                'pending_commissions' => $pendingCommissions,
                'validated_commissions' => $validatedCommissions,
                'paid_commissions' => $paidCommissions,
                'count' => $commissions->count(),
            ],
            'commissions' => $commissions->values()->all(),
        ]);
    }

    /**
     * Update individual commission status.
     */
    public function updateCommercialCommissionStatus(Request $request, $id)
    {
        $commission = CommercialCommission::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,validated,paid,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $updateData = ['status' => $validated['status']];
        if (isset($validated['notes'])) {
            $updateData['notes'] = $validated['notes'];
        }

        if ($validated['status'] === 'paid' && !$commission->paid_at) {
            $updateData['paid_at'] = now();
        } elseif ($validated['status'] !== 'paid') {
            $updateData['paid_at'] = null;
        }

        $commission->update($updateData);

        return response()->json([
            'message' => "Statut de la commission mis à jour en '{$commission->status}'.",
            'commission' => $commission->load(['commercial', 'customer']),
        ]);
    }

    /**
     * Settle (pay) all pending/validated commissions for a commercial.
     */
    public function settleCommercialCommissions(Request $request)
    {
        $validated = $request->validate([
            'commercial_id' => 'required|exists:users,id',
            'period' => 'nullable|string|max:20',
        ]);

        $query = CommercialCommission::where('commercial_id', $validated['commercial_id'])
            ->whereIn('status', ['pending', 'validated']);

        if (!empty($validated['period'])) {
            $query->where('period', $validated['period']);
        }

        $count = $query->count();
        $totalSettled = (float) $query->sum('commission_amount');

        $query->update([
            'status' => 'paid',
            'paid_at' => now(),
            'notes' => 'Règlement validé par la Direction Générale / Super Admin.',
        ]);

        return response()->json([
            'message' => "{$count} commissions réglées pour un montant total de " . number_format($totalSettled, 2, ',', ' ') . " DH.",
            'settled_count' => $count,
            'total_settled' => round($totalSettled, 2),
        ]);
    }
}
