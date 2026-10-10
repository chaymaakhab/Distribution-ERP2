<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\CommercialVisit;
use App\Models\Promotion;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Customer;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;

class NewModulesSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::first();
        $commercial = User::whereHas('roles', fn($q) => $q->where('code', 'commercial'))->first() ?? $superAdmin;
        $customers = Customer::all();
        $categories = Category::all();
        $products = Product::all();
        $orders = Order::all();

        // ---------------------------------------------------------------------
        // 1. ERP System Notifications
        // ---------------------------------------------------------------------
        $notifications = [
            [
                'type' => 'alert',
                'title' => 'Alerte stock critique · Huile Végétale 5L',
                'message' => 'Le stock au Dépôt DEP-01 Casablanca Central est inférieur au seuil d’alerte (48 bidons restants).',
                'read' => false,
                'segment' => 'inventory',
                'link' => '/stocks',
            ],
            [
                'type' => 'financial',
                'title' => 'Effet bancaire impayé · CIH Bank',
                'message' => 'Chèque CHQ-001298 (14 500 DH) rejeté pour provision insuffisante · Quincaillerie Saada.',
                'read' => false,
                'segment' => 'finance',
                'link' => '/treasury',
            ],
            [
                'type' => 'delivery',
                'title' => 'Tournée TRN-2026-08 · Livreur en route',
                'message' => 'Mehdi Lahlou a validé l’arrêt 1 (Comptoir Al Amal) et se dirige vers BatiPro Maroc.',
                'read' => false,
                'segment' => 'deliveries',
                'link' => '/deliveries',
            ],
            [
                'type' => 'operation',
                'title' => 'Nouvelle commande B2B · CMD-2407',
                'message' => 'Commande de 28 400 DH soumise par Atlas Équipements. En attente de validation commerciale.',
                'read' => false,
                'segment' => 'orders',
                'link' => '/orders',
            ],
            [
                'type' => 'operation',
                'title' => 'Réception fournisseur en transit',
                'message' => 'Bon de commande BC-2026-042 (Lesieur Cristal · 178 000 DH) attendu aujourd’hui au quai 2.',
                'read' => true,
                'segment' => 'purchasing',
                'link' => '/purchases',
            ],
        ];

        foreach ($notifications as $n) {
            Notification::firstOrCreate(
                ['title' => $n['title']],
                array_merge($n, ['user_id' => $superAdmin?->id])
            );
        }

        // ---------------------------------------------------------------------
        // 2. Commercial Visits (Tournées terrain)
        // ---------------------------------------------------------------------
        if ($customers->isNotEmpty() && $commercial) {
            $c1 = $customers->first();
            $c2 = $customers->skip(1)->first() ?? $c1;
            $c3 = $customers->skip(2)->first() ?? $c1;

            $visits = [
                [
                    'ref' => 'VIS-2026-001',
                    'commercial_id' => $commercial->id,
                    'customer_id' => $c1->id,
                    'visit_date' => now()->toDateString(),
                    'visit_type' => 'prise_commande',
                    'status' => 'realisee',
                    'checkin_lat' => 33.5898860,
                    'checkin_lng' => -7.6038690,
                    'checkin_time' => now()->subHours(3),
                    'checkout_time' => now()->subHours(2),
                    'amount_collected' => 5400.00,
                    'order_id' => $orders->first()?->id,
                    'notes' => 'Visite réussie. Prise de commande réassort et encaissement chèque d’acompte.',
                    'next_action' => 'Livraison sous 24h et relance fin de mois',
                    'next_visit_date' => now()->addDays(7)->toDateString(),
                ],
                [
                    'ref' => 'VIS-2026-002',
                    'commercial_id' => $commercial->id,
                    'customer_id' => $c2->id,
                    'visit_date' => now()->toDateString(),
                    'visit_type' => 'prospection',
                    'status' => 'en_cours',
                    'checkin_lat' => 33.5934500,
                    'checkin_lng' => -7.6201200,
                    'checkin_time' => now()->subMinutes(30),
                    'notes' => 'Présentation du nouveau catalogue outillage et négociation des remises volume.',
                    'next_action' => 'Établir un devis proforma',
                    'next_visit_date' => now()->addDays(3)->toDateString(),
                ],
                [
                    'ref' => 'VIS-2026-003',
                    'commercial_id' => $commercial->id,
                    'customer_id' => $c3->id,
                    'visit_date' => now()->addDay()->toDateString(),
                    'visit_type' => 'recouvrement',
                    'status' => 'planifiee',
                    'notes' => 'Visite de recouvrement pour facture échue depuis 15 jours.',
                    'next_action' => 'Récupération chèque ou promesse ferme',
                ],
            ];

            foreach ($visits as $v) {
                CommercialVisit::firstOrCreate(['ref' => $v['ref']], $v);
            }
        }

        // ---------------------------------------------------------------------
        // 3. Commercial Promotions & Campaigns
        // ---------------------------------------------------------------------
        $promotions = [
            [
                'code' => 'PROMO-AUTOMNE26',
                'name' => 'Campagne Automne - 10% Outillage Pro',
                'type' => 'percentage',
                'discount_value' => 10.00,
                'min_order_amount' => 5000.00,
                'start_date' => now()->subDays(10)->toDateString(),
                'end_date' => now()->addDays(20)->toDateString(),
                'category_id' => $categories->firstWhere('code', 'OUTIL')?->id ?? $categories->first()?->id,
                'customer_tier' => 'all',
                'status' => 'Actif',
            ],
            [
                'code' => 'REMISE-GROS-VIP',
                'name' => 'Remise Volume B2B VIP - 1500 DH offerts',
                'type' => 'fixed_amount',
                'discount_value' => 1500.00,
                'min_order_amount' => 30000.00,
                'start_date' => now()->startOfMonth()->toDateString(),
                'end_date' => now()->endOfMonth()->toDateString(),
                'customer_tier' => 'vip',
                'status' => 'Actif',
            ],
        ];

        foreach ($promotions as $p) {
            Promotion::firstOrCreate(['code' => $p['code']], $p);
        }

        // ---------------------------------------------------------------------
        // 4. Audit Trail Logs
        // ---------------------------------------------------------------------
        $auditLogs = [
            [
                'user_id' => $superAdmin?->id,
                'action' => 'auth.login',
                'ip_address' => '196.12.45.102',
                'properties' => ['browser' => 'Chrome/Mac', 'location' => 'Casablanca'],
                'created_at' => now()->subHours(2),
            ],
            [
                'user_id' => $commercial?->id,
                'action' => 'orders.create',
                'ip_address' => '105.158.22.4',
                'properties' => ['ref' => 'CMD-2406', 'amount' => 24860.00],
                'created_at' => now()->subHours(1),
            ],
            [
                'user_id' => $superAdmin?->id,
                'action' => 'stock.audit.adjust',
                'ip_address' => '196.12.45.102',
                'properties' => ['audit_ref' => 'INV-2026-03', 'warehouse' => 'DEP-01'],
                'created_at' => now()->subMinutes(40),
            ],
            [
                'user_id' => $superAdmin?->id,
                'action' => 'payments.record',
                'ip_address' => '105.154.89.12',
                'properties' => ['ref' => 'PAY-2026-092', 'method' => 'Check', 'amount' => 32100.00],
                'created_at' => now()->subMinutes(15),
            ],
        ];

        foreach ($auditLogs as $log) {
            AuditLog::create($log);
        }
    }
}
