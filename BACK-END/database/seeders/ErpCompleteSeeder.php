<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\ProductReturn;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Role;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class ErpCompleteSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::firstWhere('email', 'superadmin@hercules-erp.ma');
        $commercial = User::firstWhere('email', 'commercial@hercules-erp.ma');
        $casa = Warehouse::firstWhere('code', 'DEP-01');
        $rabat = Warehouse::firstWhere('code', 'DEP-02');

        // 1. Update Customers with Moroccan ICE, WhatsApp and balances
        $customersData = [
            [
                'code' => 'CLI-0084',
                'name' => 'Amine Tazi',
                'company' => 'Atlas Équipements SARL',
                'ice' => '003147829000064',
                'city' => 'Casablanca',
                'address' => '12, Boulevard Zerktouni, Maârif',
                'phone' => '+212 522 34 78 90',
                'whatsapp' => '212661234567',
                'price_tier' => 'revendeur',
                'credit_limit' => 80000.00,
                'current_balance' => 42650.00,
                'overdue_amount' => 0.00,
                'status' => 'Actif',
            ],
            [
                'code' => 'CLI-0083',
                'name' => 'Karim Berrada',
                'company' => 'BatiPro Maroc',
                'ice' => '002984123000081',
                'city' => 'Rabat',
                'address' => 'Lot 14, Zone Industrielle Takaddoum',
                'phone' => '+212 537 22 16 40',
                'whatsapp' => '212661987654',
                'price_tier' => 'chantier',
                'credit_limit' => 50000.00,
                'current_balance' => 18420.00,
                'overdue_amount' => 0.00,
                'status' => 'Actif',
            ],
            [
                'code' => 'CLI-0082',
                'name' => 'Hassan Mansouri',
                'company' => 'Maison du Bricolage',
                'ice' => '001854902000055',
                'city' => 'Marrakech',
                'address' => '88, Avenue Allal El Fassi',
                'phone' => '+212 524 38 05 17',
                'whatsapp' => '212662112233',
                'price_tier' => 'revendeur',
                'credit_limit' => 35000.00,
                'current_balance' => 38200.00,
                'overdue_amount' => 8400.00,
                'status' => 'À surveiller',
            ],
            [
                'code' => 'CLI-0081',
                'name' => 'Mohamed Fassi',
                'company' => 'Comptoir Al Amal',
                'ice' => '004128901000092',
                'city' => 'Fès',
                'address' => '45, Rue des Selliers, Medina',
                'phone' => '+212 535 61 20 08',
                'whatsapp' => '212663445566',
                'price_tier' => 'grossiste',
                'credit_limit' => 100000.00,
                'current_balance' => 32100.00,
                'overdue_amount' => 32100.00,
                'status' => 'À surveiller',
            ],
            [
                'code' => 'CLI-0080',
                'name' => 'Rachid Belkacem',
                'company' => 'Nord Industrie',
                'ice' => '002761820000019',
                'city' => 'Tanger',
                'address' => 'Zone Franche de Tanger, Lot 8',
                'phone' => '+212 539 94 11 22',
                'whatsapp' => '212661889900',
                'price_tier' => 'revendeur',
                'credit_limit' => 60000.00,
                'current_balance' => 6280.00,
                'overdue_amount' => 0.00,
                'status' => 'Actif',
            ],
            [
                'code' => 'CLI-0079',
                'name' => 'Omar Slaoui',
                'company' => 'Quincaillerie Saada',
                'ice' => '003982145000073',
                'city' => 'Agadir',
                'address' => 'Zone Industrielle Anza',
                'phone' => '+212 528 84 55 60',
                'whatsapp' => '212664778899',
                'price_tier' => 'revendeur',
                'credit_limit' => 40000.00,
                'current_balance' => 42100.00,
                'overdue_amount' => 14500.00,
                'status' => 'Bloqué',
            ],
        ];

        foreach ($customersData as $cd) {
            Customer::updateOrCreate(
                ['code' => $cd['code']],
                array_merge($cd, [
                    'commercial_id' => $commercial?->id,
                    'password' => Hash::make('password'),
                ])
            );
        }

        // 2. Seed Drivers (3 types: depot_to_client, depot_to_depot, pre_seller)
        $drivers = [
            [
                'name' => 'Mehdi Lahlou',
                'phone' => '+212 661 23 45 67',
                'cin' => 'BK458921',
                'license_number' => 'PERM-45129',
                'driver_type' => 'depot_to_client',
                'warehouse_id' => $casa?->id,
                'assigned_route' => 'Grand Casablanca & Ain Sebaâ',
                'vehicle_model' => 'Renault Master 3.5T',
                'vehicle_plate' => '23-A-54321',
                'capacity' => '3.5 T / 4 Palettes',
                'status' => 'en_tournee',
                'current_mission' => 'Tournée TRN-2026-08 (3 clients)',
            ],
            [
                'name' => 'Rachid Tazi',
                'phone' => '+212 663 88 99 00',
                'cin' => 'BJ891234',
                'license_number' => 'PERM-89012',
                'driver_type' => 'depot_to_client',
                'warehouse_id' => $casa?->id,
                'assigned_route' => 'Bernoussi & Tit Mellil',
                'vehicle_model' => 'Peugeot Boxer 3.5T',
                'vehicle_plate' => '26-B-12984',
                'capacity' => '3.5 T / 4 Palettes',
                'status' => 'disponible',
                'current_mission' => null,
            ],
            [
                'name' => 'Yassine Alami',
                'phone' => '+212 662 11 22 33',
                'cin' => 'A782901',
                'license_number' => 'PERM-11223',
                'driver_type' => 'depot_to_depot',
                'warehouse_id' => $casa?->id,
                'assigned_route' => 'Ligne 1 : Casablanca (DEP-01) ↔ Rabat (DEP-02)',
                'vehicle_model' => 'Isuzu FTR 10T (Navette)',
                'vehicle_plate' => '1-A-87654',
                'capacity' => '10 T / 12 Palettes',
                'status' => 'en_transit',
                'current_mission' => 'Transfert TR-2026-14 (120 articles)',
            ],
            [
                'name' => 'Hamid El Meskini',
                'phone' => '+212 665 44 33 22',
                'cin' => 'BK678901',
                'license_number' => 'PERM-99412',
                'driver_type' => 'pre_seller', // Livreur-pré-vendeur
                'warehouse_id' => $casa?->id,
                'assigned_route' => 'Tournée Épiceries & Drogueries Proximité (Casablanca Sud)',
                'vehicle_model' => 'Hyundai H350 Fourgon-Magasin',
                'vehicle_plate' => '6-D-33441',
                'capacity' => '2.5 T / Stock Embarqué',
                'status' => 'en_tournee',
                'current_mission' => 'Visite 12 boutiques · Vente directe & Bons sur place',
            ],
            [
                'name' => 'Karim Bennis',
                'phone' => '+212 667 99 88 77',
                'cin' => 'BL345678',
                'license_number' => 'PERM-77654',
                'driver_type' => 'pre_seller',
                'warehouse_id' => $casa?->id,
                'assigned_route' => 'Tournée Quincailleries & Sanitaires (Grand Casablanca)',
                'vehicle_model' => 'Mercedes Sprinter Van Sales',
                'vehicle_plate' => '23-C-99881',
                'capacity' => '3.0 T / Stock Embarqué',
                'status' => 'disponible',
                'current_mission' => null,
            ],
        ];

        foreach ($drivers as $d) {
            Driver::updateOrCreate(
                ['name' => $d['name'], 'license_number' => $d['license_number']],
                $d
            );
        }

        // 3. Seed Payments / Règlements Clients with Moroccan vouchers
        $clientAtlas = Customer::firstWhere('code', 'CLI-0084');
        $clientBati = Customer::firstWhere('code', 'CLI-0083');
        $clientNord = Customer::firstWhere('code', 'CLI-0080');
        $clientAmal = Customer::firstWhere('code', 'CLI-0081');

        $payments = [
            [
                'ref' => 'PAY-2026-0891',
                'receipt_number' => 'REC-2026-0891',
                'customer_id' => $clientAtlas?->id,
                'method' => 'Chèque bancaire',
                'bank' => 'Attijariwafa Bank',
                'doc_number' => 'CHQ-889021',
                'due_date' => '20 Oct 2026',
                'amount' => 15000.00,
                'previous_balance' => 57650.00,
                'new_balance' => 42650.00,
                'user_id' => $commercial?->id,
                'notes' => 'Acompte commandes en cours',
                'status' => 'Encaissé',
            ],
            [
                'ref' => 'PAY-2026-0890',
                'receipt_number' => 'REC-2026-0890',
                'customer_id' => $clientBati?->id,
                'method' => 'Virement bancaire',
                'bank' => 'Banque Populaire (BCP)',
                'doc_number' => 'VIR-BP-49021',
                'due_date' => '07 Oct 2026',
                'amount' => 8000.00,
                'previous_balance' => 26420.00,
                'new_balance' => 18420.00,
                'user_id' => $commercial?->id,
                'notes' => 'Règlement livraison chantier Rabat',
                'status' => 'Encaissé',
            ],
            [
                'ref' => 'PAY-2026-0889',
                'receipt_number' => 'REC-2026-0889',
                'customer_id' => $clientNord?->id,
                'method' => 'Espèces',
                'bank' => null,
                'doc_number' => 'QC-CAS-1049',
                'due_date' => null,
                'amount' => 10000.00,
                'previous_balance' => 16280.00,
                'new_balance' => 6280.00,
                'user_id' => $commercial?->id,
                'notes' => 'Versement direct comptoir Tanger',
                'status' => 'Encaissé',
            ],
            [
                'ref' => 'PAY-2026-0888',
                'receipt_number' => 'REC-2026-0888',
                'customer_id' => $clientAmal?->id,
                'method' => 'Traite / Effet',
                'bank' => 'Attijariwafa Bank',
                'doc_number' => 'EFF-AT-0941',
                'due_date' => '30 Nov 2026',
                'amount' => 25000.00,
                'previous_balance' => 57100.00,
                'new_balance' => 32100.00,
                'user_id' => $commercial?->id,
                'notes' => 'Traite commerciale acceptée 60 jours',
                'status' => 'Encaissé',
            ],
        ];

        foreach ($payments as $p) {
            if ($p['customer_id']) {
                Payment::updateOrCreate(['ref' => $p['ref']], $p);
            }
        }

        // 4. Seed Product Returns with SuperAdmin approval
        $productPerceuse = Product::firstWhere('sku', 'HRC-0850');
        $productDisque = Product::firstWhere('sku', 'CUT-230D');
        $productGroupe = Product::firstWhere('sku', 'GEN-5000');

        $returns = [
            [
                'ref' => 'RET-2026-001',
                'customer_id' => $clientAtlas?->id,
                'product_id' => $productPerceuse?->id,
                'quantity' => 2,
                'amount' => 2498.00,
                'reason' => 'Défaut moteur sur 2 unités constatées à l\'ouverture du carton.',
                'condition' => 'defaillant_sav',
                'restock_approved' => false, // Produit non réintégrable au stock vente
                'status' => 'Validé',
                'validated_by_user_id' => $superadmin?->id,
                'validated_at' => Carbon::now()->subDays(2),
                'superadmin_notes' => 'Retour SAV validé. Expédier au fabricant pour remplacement sous garantie.',
            ],
            [
                'ref' => 'RET-2026-002',
                'customer_id' => $clientBati?->id,
                'product_id' => $productDisque?->id,
                'quantity' => 5,
                'amount' => 947.50,
                'reason' => 'Erreur de référence lors de la commande client (voulait 125mm au lieu de 230mm). Emballage scellé intact.',
                'condition' => 'neuf_recommercialisable',
                'restock_approved' => true, // Produit remis en stock !
                'status' => 'Validé',
                'validated_by_user_id' => $superadmin?->id,
                'validated_at' => Carbon::now()->subDay(),
                'superadmin_notes' => 'Vérification emballage effectuée par Nadia (Dépôt Casa). Réintégration en stock disponible autorisée.',
            ],
            [
                'ref' => 'RET-2026-003',
                'customer_id' => $clientAtlas?->id,
                'product_id' => $productGroupe?->id,
                'quantity' => 1,
                'amount' => 8950.00,
                'reason' => 'Refus client à la livraison sans accord commercial préalable.',
                'condition' => 'neuf_recommercialisable',
                'restock_approved' => false,
                'status' => 'En attente validation',
                'validated_by_user_id' => null,
                'validated_at' => null,
                'superadmin_notes' => 'En attente de justification du commercial Youssef Bennani.',
            ],
        ];

        foreach ($returns as $ret) {
            if ($ret['customer_id'] && $ret['product_id']) {
                ProductReturn::updateOrCreate(['ref' => $ret['ref']], $ret);
            }
        }

        // 5. Seed Quotes / Devis
        $quotes = [
            [
                'ref' => 'DEV-2026-042',
                'customer_id' => $clientAtlas?->id,
                'commercial_id' => $commercial?->id,
                'date' => Carbon::now()->subDays(3)->toDateString(),
                'valid_until' => Carbon::now()->addDays(27)->toDateString(),
                'total_ht' => 32000.00,
                'total_tva' => 6400.00,
                'total_ttc' => 38400.00,
                'status' => 'Envoyé',
                'notes' => 'Offre promotionnelle outillage & groupes électrogènes pour revendeur.',
                'items' => [
                    ['product_id' => $productPerceuse?->id, 'quantity' => 20, 'unit_price' => 1124.10, 'total' => 22482.00],
                    ['product_id' => $productDisque?->id, 'quantity' => 50, 'unit_price' => 170.55, 'total' => 8527.50],
                ],
            ],
            [
                'ref' => 'DEV-2026-041',
                'customer_id' => $clientBati?->id,
                'commercial_id' => $commercial?->id,
                'date' => Carbon::now()->subDays(7)->toDateString(),
                'valid_until' => Carbon::now()->addDays(23)->toDateString(),
                'total_ht' => 20816.67,
                'total_tva' => 4163.33,
                'total_ttc' => 24980.00,
                'status' => 'Accepté',
                'notes' => 'Devis fournitures pour chantier Rabat Agdal.',
                'items' => [
                    ['product_id' => $productPerceuse?->id, 'quantity' => 10, 'unit_price' => 1124.10, 'total' => 11241.00],
                ],
            ],
        ];

        foreach ($quotes as $q) {
            $items = $q['items'];
            unset($q['items']);
            if ($q['customer_id']) {
                $quote = Quote::updateOrCreate(['ref' => $q['ref']], $q);
                foreach ($items as $item) {
                    if ($item['product_id']) {
                        QuoteItem::updateOrCreate([
                            'quote_id' => $quote->id,
                            'product_id' => $item['product_id'],
                        ], $item);
                    }
                }
            }
        }
    }
}
