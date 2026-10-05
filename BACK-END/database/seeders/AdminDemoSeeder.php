<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Role;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * Rich, deterministic demo data for the SuperAdmin / Administrateur dashboard:
 * geolocated warehouses, sales reps, drivers, a customer portfolio across four
 * cities and ~120 orders spread over the last 90 days with their deliveries,
 * invoices and payments.
 *
 * Seeded once: it bails out if its own orders already exist. Use
 * `migrate:fresh --seed` to rebuild from scratch.
 */
class AdminDemoSeeder extends Seeder
{
    private const CITIES = [
        'Casablanca' => ['code' => 'DEP-01', 'lat' => 33.5731, 'lng' => -7.5898],
        'Rabat' => ['code' => 'DEP-02', 'lat' => 34.0209, 'lng' => -6.8416],
        'Marrakech' => ['code' => 'DEP-03', 'lat' => 31.6295, 'lng' => -7.9811],
        'Tanger' => ['code' => 'DEP-04', 'lat' => 35.7595, 'lng' => -5.8340],
    ];

    public function run(): void
    {
        if (Order::where('ref', 'CMD-S0001')->exists()) {
            $this->command?->warn('AdminDemoSeeder: données déjà présentes, ignoré.');

            return;
        }

        // Deterministic pseudo-random data.
        mt_srand(20261005);

        $warehouses = $this->seedWarehouses();
        $commercials = $this->seedCommercials($warehouses);
        $drivers = $this->seedDrivers($warehouses);
        $customers = $this->seedCustomers($commercials);
        $products = Product::where('status', 'Actif')->get();

        if ($products->isEmpty()) {
            $this->command?->error('AdminDemoSeeder: aucun produit. Lancez CustomerPortalSeeder d’abord.');

            return;
        }

        // Ensure every warehouse has stock for the catalog (for the map + KPIs).
        $this->seedStocks($warehouses, $products);

        $this->seedOrders($customers, $products, $warehouses, $drivers);

        $this->command?->info('AdminDemoSeeder: dépôts, équipe, clients et ~120 commandes générés.');
    }

    private function seedWarehouses(): array
    {
        $defs = [
            ['DEP-01', 'Dépôt Casablanca', 'Casablanca', 'Zone industrielle · Aïn Sebaâ', 33.6011, -7.5481, '+212522000001', 'Nadia El Amrani', 'Actif'],
            ['DEP-02', 'Dépôt Rabat', 'Rabat', 'Hay Nahda · Rabat', 34.0150, -6.8310, '+212537000002', 'Said Amrani', 'Actif'],
            ['DEP-03', 'Dépôt Marrakech', 'Marrakech', 'Route de Casablanca · Sidi Ghanem', 31.6400, -8.0100, '+212524000003', 'Hind Benjelloun', 'Actif'],
            ['DEP-04', 'Dépôt Tanger', 'Tanger', 'Zone franche · Gzenaya', 35.7400, -5.8900, '+212539000004', 'Omar Cherif', 'Saturé'],
        ];

        $out = [];
        foreach ($defs as [$code, $name, $city, $address, $lat, $lng, $phone, $manager, $status]) {
            $out[$code] = Warehouse::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'city' => $city,
                    'address' => $address,
                    'lat' => $lat,
                    'lng' => $lng,
                    'phone' => $phone,
                    'manager_name' => $manager,
                    'status' => $status,
                ]
            );
        }

        return $out;
    }

    private function seedCommercials(array $warehouses): array
    {
        $role = Role::where('code', 'commercial')->firstOrFail();

        $defs = [
            ['commercial@hercules-erp.ma', 'Youssef Bennani', 'DEP-01'],
            ['salma@hercules-erp.ma', 'Salma Idrissi', 'DEP-02'],
            ['omar@hercules-erp.ma', 'Omar Tazi', 'DEP-03'],
            ['hicham@hercules-erp.ma', 'Hicham Alaoui', 'DEP-04'],
        ];

        $out = [];
        foreach ($defs as [$email, $name, $depot]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'locale' => 'fr',
                    'warehouse_id' => $warehouses[$depot]->id,
                ]
            );
            $user->roles()->syncWithoutDetaching([$role->id => ['is_primary' => true]]);
            $out[] = $user;
        }

        return $out;
    }

    private function seedDrivers(array $warehouses): array
    {
        $role = Role::where('code', 'delivery')->firstOrFail();

        $defs = [
            ['livreur@hercules-erp.ma', 'Mehdi Lahlou', 'DEP-01'],
            ['karim@hercules-erp.ma', 'Karim Bakkali', 'DEP-02'],
            ['abdel@hercules-erp.ma', 'Abdelhak Rahmouni', 'DEP-03'],
            ['youssef.a@hercules-erp.ma', 'Youssef Amrani', 'DEP-04'],
        ];

        $out = [];
        foreach ($defs as [$email, $name, $depot]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'locale' => 'fr',
                    'warehouse_id' => $warehouses[$depot]->id,
                ]
            );
            $user->roles()->syncWithoutDetaching([$role->id => ['is_primary' => true]]);
            $out[] = $user;
        }

        return $out;
    }

    private function seedCustomers(array $commercials): array
    {
        $names = [
            'Atlas Équipements', 'BatiPro Maroc', 'Maison du Bricolage', 'Comptoir Al Amal',
            'Nord Industrie', 'Quincaillerie Saada', 'Électricité Benali', 'Chantiers El Idrissi',
            'Pro Matériel Souss', 'Distrib Benslimane', 'Outillage Rif', 'Matériaux Saïss',
            'Hydro Plus', 'Energitex', 'Riad Quincaillerie', 'Société Moderne du Bâtiment',
            'Atlantic Outils', 'Zerktouni Matériaux',
        ];

        $tiers = ['standard', 'revendeur', 'grossiste', 'chantier'];
        $cities = array_keys(self::CITIES);
        $out = [];

        foreach ($names as $i => $name) {
            $city = $cities[$i % count($cities)];
            $geo = self::CITIES[$city];
            $commercial = $commercials[$i % count($commercials)];
            $code = 'CLI-1'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT);

            $out[] = Customer::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'company' => $name.' SARL',
                    'city' => $city,
                    'address' => 'Lotissement industriel, '.$city,
                    'lat' => $geo['lat'] + (mt_rand(-40, 40) / 1000),
                    'lng' => $geo['lng'] + (mt_rand(-40, 40) / 1000),
                    'phone' => '+2125'.mt_rand(10000000, 99999999),
                    'price_tier' => $tiers[$i % count($tiers)],
                    'credit_limit' => [30000, 50000, 80000, 120000][$i % 4],
                    'status' => $i % 9 === 0 ? 'À surveiller' : 'Actif',
                    'locale' => 'fr',
                    'commercial_id' => $commercial->id,
                ]
            );
        }

        return $out;
    }

    private function seedStocks(array $warehouses, $products): void
    {
        foreach (array_values($warehouses) as $wi => $warehouse) {
            foreach ($products as $pi => $product) {
                if (Stock::where('product_id', $product->id)->where('warehouse_id', $warehouse->id)->exists()) {
                    continue;
                }
                $onHand = (($pi * 7 + $wi * 13) % 15) === 0 ? 0 : mt_rand(5, 220);
                Stock::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'on_hand' => $onHand,
                    'reserved' => (int) floor($onHand * 0.12),
                    'min_threshold' => 10,
                ]);
            }
        }
    }

    private function seedOrders(array $customers, $products, array $warehouses, array $drivers): void
    {
        // status => weight
        $statuses = [
            'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
            'in_delivery', 'in_delivery', 'confirmed', 'confirmed', 'prepared', 'assigned',
            'pending_validation', 'pending_validation', 'pending_validation', 'cancelled', 'returned',
        ];
        $sources = ['Commercial', 'Commercial', 'Téléphone', 'Portail client'];
        $cityToDepot = array_map(fn ($c) => $c['code'], self::CITIES);

        $total = 120;
        for ($n = 1; $n <= $total; $n++) {
            $ref = 'CMD-S'.str_pad((string) $n, 4, '0', STR_PAD_LEFT);

            /** @var Customer $customer */
            $customer = $customers[mt_rand(0, count($customers) - 1)];
            $depotCode = $cityToDepot[$customer->city] ?? 'DEP-01';
            $warehouse = $warehouses[$depotCode];

            // Spread over the last 90 days; keep a handful dated today.
            $daysAgo = $n <= 6 ? 0 : mt_rand(0, 89);
            $date = now()->subDays($daysAgo)->toDateString();

            $status = $statuses[mt_rand(0, count($statuses) - 1)];
            $source = $sources[mt_rand(0, count($sources) - 1)];

            // Build 1–4 order lines.
            $lineCount = mt_rand(1, min(4, $products->count()));
            $chosen = $products->shuffle()->take($lineCount);
            $lines = [];
            $orderTotal = 0.0;
            foreach ($chosen as $product) {
                $qty = mt_rand(1, 20);
                $unit = $product->priceForTier($customer->price_tier);
                $lineTotal = round($unit * $qty, 2);
                $orderTotal += $lineTotal;
                $lines[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $unit,
                    'total' => $lineTotal,
                ];
            }
            $orderTotal = round($orderTotal, 2);

            $order = Order::create([
                'ref' => $ref,
                'customer_id' => $customer->id,
                'warehouse_id' => $warehouse->id,
                'commercial_id' => $customer->commercial_id,
                'city' => $customer->city,
                'date' => $date,
                'total' => $orderTotal,
                'discount' => 0,
                'status' => $status,
                'source' => $source,
            ]);

            $order->items()->createMany($lines);

            // Deliveries for orders that reached the field.
            if (in_array($status, ['assigned', 'in_delivery', 'delivered'], true)) {
                $driver = $drivers[mt_rand(0, count($drivers) - 1)];
                $deliveryStatus = $status === 'delivered' ? 'Livrée' : ($status === 'in_delivery' ? 'En route' : 'À charger');
                Delivery::create([
                    'ref' => 'LIV-'.$ref,
                    'order_id' => $order->id,
                    'tour_name' => 'Tournée '.$customer->city,
                    'driver_name' => $driver->name,
                    'amount' => $orderTotal,
                    'status' => $deliveryStatus,
                ]);
            }

            // Invoicing + payment for delivered orders.
            if ($status === 'delivered') {
                $roll = mt_rand(0, 10);
                $paid = $roll >= 7 ? $orderTotal : ($roll >= 4 ? round($orderTotal * 0.5, 2) : 0.0);
                $invoice = Invoice::create([
                    'ref' => 'FAC-'.$ref,
                    'order_id' => $order->id,
                    'customer_id' => $customer->id,
                    'total_ttc' => $orderTotal,
                    'paid_amount' => $paid,
                    'status' => $paid >= $orderTotal ? 'Payée' : ($paid > 0 ? 'Partielle' : 'Impayée'),
                    'due_date' => Carbon::parse($date)->addDays(30)->toDateString(),
                ]);

                if ($paid > 0) {
                    $payment = new Payment([
                        'ref' => 'REG-'.$ref,
                        'customer_id' => $customer->id,
                        'method' => ['Virement', 'Espèces', 'Chèque'][mt_rand(0, 2)],
                        'amount' => $paid,
                        'status' => 'Affecté',
                    ]);
                    // Backdate to the order day so "payments by period" is meaningful.
                    $payment->created_at = Carbon::parse($date);
                    $payment->updated_at = Carbon::parse($date);
                    $payment->save();
                }
            }
        }

        $this->forceStockHealth($products);
    }

    /**
     * Make the stock KPIs illustrative: a couple of full ruptures and a few
     * low-stock references across every warehouse.
     */
    private function forceStockHealth($products): void
    {
        $ruptureIdx = [3, 8];
        $lowIdx = [1, 6, 10];

        foreach ($products as $i => $product) {
            if (in_array($i, $ruptureIdx, true)) {
                Stock::where('product_id', $product->id)->update(['on_hand' => 0, 'reserved' => 0]);
            } elseif (in_array($i, $lowIdx, true)) {
                Stock::where('product_id', $product->id)->update(['on_hand' => 4, 'reserved' => 0, 'min_threshold' => 10]);
            }
        }
    }
}
