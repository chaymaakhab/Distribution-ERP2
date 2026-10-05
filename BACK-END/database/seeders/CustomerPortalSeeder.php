<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerPortalSeeder extends Seeder
{
    public function run(): void
    {
        $commercial = User::updateOrCreate(
            ['email' => 'commercial@hercules-erp.ma'],
            ['name' => 'Youssef Bennani', 'password' => Hash::make('password')]
        );

        $casa = Warehouse::updateOrCreate(['code' => 'DEP-01'], [
            'name' => 'Dépôt Casablanca', 'city' => 'Casablanca',
            'address' => 'Zone industrielle · Aïn Sebaâ',
        ]);
        $rabat = Warehouse::updateOrCreate(['code' => 'DEP-02'], [
            'name' => 'Dépôt Rabat', 'city' => 'Rabat',
            'address' => 'Hay Nahda · Rabat',
        ]);

        $categories = [
            'ELE' => 'Électricité',
            'PLO' => 'Plomberie',
            'OUT' => 'Outillage',
            'ENE' => 'Énergie',
            'QUI' => 'Quincaillerie',
        ];
        foreach ($categories as $code => $name) {
            Category::updateOrCreate(['code' => $code], ['name' => $name]);
        }

        // code, name, category, sku, base price, vat, packaging, unit, description
        $catalog = [
            ['PRD-0018', 'Perceuse à percussion 850W', 'OUT', 'HRC-0850', 1249.00, 20, 'Carton · 4 unités', 'Pièce', 'Perceuse à percussion 850W, mandrin 13 mm, coffret inclus.'],
            ['PRD-0017', 'Disque diamant 230 mm', 'OUT', 'CUT-230D', 189.50, 20, 'Pièce', 'Pièce', 'Disque diamant segmenté 230 mm pour béton et pierre.'],
            ['PRD-0016', 'Pompe immergée 1.5 HP', 'PLO', 'PMP-15HP', 3840.00, 14, 'Pièce', 'Pièce', 'Pompe immergée inox 1.5 HP, débit 6 m³/h.'],
            ['PRD-0015', 'Câble électrique 3G2.5', 'ELE', 'CAB-3G25', 12.80, 20, 'Mètre', 'Mètre', 'Câble souple 3G2.5 mm², gaine PVC, vendu au mètre.'],
            ['PRD-0014', 'Groupe électrogène 5 kVA', 'ENE', 'GEN-5000', 8950.00, 20, 'Pièce', 'Pièce', 'Groupe électrogène diesel 5 kVA, démarrage électrique.'],
            ['PRD-0013', 'Tableau électrique 12 modules', 'ELE', 'TAB-12M', 320.00, 20, 'Pièce', 'Pièce', 'Tableau de répartition 12 modules avec porte.'],
            ['PRD-0012', 'Tuyau PVC pression DN50', 'PLO', 'TUY-DN50', 78.00, 14, 'Barre 4 m', 'Barre', 'Tuyau PVC pression DN50, PN10, barre de 4 mètres.'],
            ['PRD-0011', 'Charnière inox 100 mm', 'QUI', 'CHA-100I', 15.50, 20, 'Sachet · 6', 'Sachet', 'Charnière inox 100 mm, lot de 6 pièces.'],
            ['PRD-0010', 'Vis à béton 7.5 x 92', 'QUI', 'VIS-7592', 42.00, 20, 'Boîte · 100', 'Boîte', 'Vis à béton 7.5 x 92 mm, boîte de 100, fixation directe.'],
            ['PRD-0009', 'Disjoncteur différentiel 40A', 'ELE', 'DIS-40A', 285.00, 20, 'Pièce', 'Pièce', 'Disjoncteur différentiel 40A 30mA type AC.'],
            ['PRD-0008', 'Raccord laiton 20/27', 'PLO', 'RAC-2027', 24.00, 14, 'Pièce', 'Pièce', 'Raccord laiton mâle 20/27 pour plomberie.'],
            ['PRD-0007', 'Projecteur LED 100W', 'ELE', 'PRJ-100W', 610.00, 20, 'Pièce', 'Pièce', 'Projecteur LED 100W IP66, 10 000 lumens.'],
        ];

        $tierMultiplier = [
            'standard' => 1.00,
            'revendeur' => 0.90,
            'grossiste' => 0.82,
            'chantier' => 0.88,
        ];

        $products = [];
        foreach ($catalog as [$code, $name, $catCode, $sku, $price, $vat, $packaging, $unit, $desc]) {
            $category = Category::where('code', $catCode)->first();
            $product = Product::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => $desc,
                    'category_id' => $category->id,
                    'sku' => $sku,
                    'price' => $price,
                    'vat_rate' => $vat,
                    'packaging' => $packaging,
                    'unit' => $unit,
                    'status' => 'Actif',
                    'visible_portal' => true,
                    'min_order_qty' => 1,
                ]
            );

            foreach ($tierMultiplier as $tier => $mult) {
                ProductPrice::updateOrCreate(
                    ['product_id' => $product->id, 'tier' => $tier],
                    ['price' => round($price * $mult, 2)]
                );
            }

            // Stock spread over the two warehouses.
            $stockGrid = [40, 120, 6, 480, 9, 25, 200, 300, 150, 60, 180, 34];
            $onHandCasa = $stockGrid[$product->id % 12] ?? 50;
            Stock::updateOrCreate(
                ['product_id' => $product->id, 'warehouse_id' => $casa->id],
                ['on_hand' => $onHandCasa, 'reserved' => (int) floor($onHandCasa * 0.15), 'min_threshold' => 10]
            );
            Stock::updateOrCreate(
                ['product_id' => $product->id, 'warehouse_id' => $rabat->id],
                ['on_hand' => (int) floor($onHandCasa * 0.6), 'reserved' => 0, 'min_threshold' => 5]
            );

            $products[] = $product;
        }

        // Force one product into rupture for a realistic "rupture de stock" case.
        Stock::where('product_id', $products[4]->id)->update(['on_hand' => 0, 'reserved' => 0]);

        // --- Demo customer ------------------------------------------------
        $customer = Customer::updateOrCreate(
            ['code' => 'CLI-0084'],
            [
                'name' => 'Atlas Équipements',
                'company' => 'Atlas Équipements SARL',
                'city' => 'Casablanca',
                'address' => '12, bd Zerktouni, Casablanca',
                'lat' => 33.5731,
                'lng' => -7.5898,
                'phone' => '+212522347890',
                'email' => 'contact@atlas-equipements.ma',
                'password' => Hash::make('client1234'),
                'price_tier' => 'revendeur',
                'credit_limit' => 80000,
                'status' => 'Actif',
                'locale' => 'fr',
                'commercial_id' => $commercial->id,
            ]
        );

        // --- Sample orders + invoices -------------------------------------
        $this->createSampleOrder($customer, $products, 'CMD-DEMO01', now()->subDays(12)->toDateString(), 'delivered', true, 24860.00);
        $this->createSampleOrder($customer, $products, 'CMD-DEMO02', now()->subDays(6)->toDateString(), 'in_delivery', false, 9735.00);
        $this->createSampleOrder($customer, $products, 'CMD-DEMO03', now()->subDays(1)->toDateString(), 'pending_validation', false, 4210.50);

        $this->command?->info('Customer portal seeded. Login: contact@atlas-equipements.ma / client1234');
    }

    private function createSampleOrder(Customer $customer, array $products, string $ref, string $date, string $status, bool $invoiced, float $total): void
    {
        $order = Order::updateOrCreate(
            ['ref' => $ref],
            [
                'customer_id' => $customer->id,
                'city' => $customer->city,
                'date' => $date,
                'total' => $total,
                'discount' => 0,
                'status' => $status,
                'source' => 'Portail client',
            ]
        );

        if ($order->items()->count() === 0) {
            $order->items()->create([
                'product_id' => $products[0]->id,
                'quantity' => 5,
                'unit_price' => round($total / 5, 2),
                'total' => $total,
            ]);
        }

        if ($invoiced) {
            $paid = round($total * 0.5, 2);
            $invoice = Invoice::updateOrCreate(
                ['ref' => 'FAC-'.$ref],
                [
                    'order_id' => $order->id,
                    'customer_id' => $customer->id,
                    'total_ttc' => $total,
                    'paid_amount' => $paid,
                    'status' => $paid >= $total ? 'Payée' : 'Partielle',
                    'due_date' => \Illuminate\Support\Carbon::parse($date)->addMonth()->toDateString(),
                ]
            );

            if ($paid > 0 && ! Payment::where('ref', 'REG-'.$ref)->exists()) {
                Payment::create([
                    'ref' => 'REG-'.$ref,
                    'customer_id' => $customer->id,
                    'method' => 'Virement',
                    'amount' => $paid,
                    'status' => 'Affecté',
                ]);
            }
        }
    }
}
