<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompanySetting;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Warehouse;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\User;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\PickingList;
use App\Models\PickingItem;
use App\Models\DeliveryTour;
use App\Models\DeliveryTourStop;
use App\Models\DeliverySlip;
use App\Models\DeliverySlipItem;
use App\Models\CreditNote;
use App\Models\CreditNoteItem;
use App\Models\ProductReturn;
use App\Models\ReturnItem;
use App\Models\CashClosing;
use App\Models\ChequeInHand;
use App\Models\StockMovement;
use App\Models\InventoryAudit;
use App\Models\InventoryAuditItem;

class ExtendedModulesSeeder extends Seeder
{
    public function run(): void
    {
        $casa = Warehouse::where('code', 'DEP-01')->first() ?? Warehouse::first();
        $rabat = Warehouse::where('code', 'DEP-02')->first() ?? $casa;
        $superAdmin = User::first();
        $products = Product::all()->keyBy('sku');
        $customers = Customer::all()->keyBy('code');
        $suppliers = Supplier::all()->keyBy('code');
        $drivers = Driver::all()->keyBy('name');

        // ---------------------------------------------------------------------
        // 1. Paramètres entreprise marocains
        // ---------------------------------------------------------------------
        CompanySetting::firstOrCreate(
            ['ice' => '002874195000038'],
            [
                'company_name' => 'DISTRI-MAROC LOGISTIQUE SARL',
                'brand_name' => 'Atlas Distribution',
                'rc' => '54210 Casablanca',
                'if_tax' => '40192837',
                'patente' => '38291045',
                'cnss' => '7819203',
                'capital' => 5000000.00,
                'address' => 'Zone Industrielle Ain Sebaâ, Route 110',
                'city' => 'Casablanca',
                'phone' => '+212 522 35 44 00',
                'email' => 'contact@atlasdistribution.ma',
                'website' => 'https://atlasdistribution.ma',
                'bank_name' => 'Attijariwafa Bank',
                'rib' => '007 780 0001234567890123 45',
                'swift' => 'BCMAMAMC',
                'default_tva_rate' => 20.00,
            ]
        );

        // ---------------------------------------------------------------------
        // 2. Flotte de Véhicules
        // ---------------------------------------------------------------------
        $fleetData = [
            [
                'plate_number' => '23-A-54321',
                'model' => 'Renault Master 3.5T',
                'vehicle_type' => 'Camion 3.5T',
                'capacity' => '3.5 T / 4 Palettes',
                'warehouse_id' => $casa?->id,
                'driver_name' => 'Mehdi Lahlou',
                'mileage' => 45200,
                'technical_visit_expiry' => '2027-04-15',
                'insurance_expiry' => '2027-02-28',
                'status' => 'en_mission',
            ],
            [
                'plate_number' => '18-B-12984',
                'model' => 'Peugeot Boxer 3.5T',
                'vehicle_type' => 'Camion 3.5T',
                'capacity' => '3.5 T / 4 Palettes',
                'warehouse_id' => $casa?->id,
                'driver_name' => 'Rachid Tazi',
                'mileage' => 62100,
                'technical_visit_expiry' => '2026-11-20',
                'insurance_expiry' => '2027-01-10',
                'status' => 'disponible',
            ],
            [
                'plate_number' => '14-A-87654',
                'model' => 'Isuzu Forward 8T',
                'vehicle_type' => 'Camion 8T',
                'capacity' => '8.0 T / 12 Palettes',
                'warehouse_id' => $casa?->id,
                'driver_name' => 'Youssef Berrada',
                'mileage' => 118400,
                'technical_visit_expiry' => '2027-03-01',
                'insurance_expiry' => '2026-12-31',
                'status' => 'en_mission',
            ],
            [
                'plate_number' => '06-D-45210',
                'model' => 'Volvo FL 12T',
                'vehicle_type' => 'Camion 12T',
                'capacity' => '12.0 T / 16 Palettes',
                'warehouse_id' => $casa?->id,
                'driver_name' => 'Hassan Benmoussa',
                'mileage' => 84000,
                'technical_visit_expiry' => '2027-05-18',
                'insurance_expiry' => '2027-03-31',
                'status' => 'disponible',
            ],
            [
                'plate_number' => '33-C-76512',
                'model' => 'Citroën Jumper 3.5T',
                'vehicle_type' => 'Camion 3.5T',
                'capacity' => '3.5 T / 4 Palettes',
                'warehouse_id' => $rabat?->id,
                'driver_name' => 'Karim Mansour',
                'mileage' => 38900,
                'technical_visit_expiry' => '2027-06-30',
                'insurance_expiry' => '2027-04-15',
                'status' => 'disponible',
            ],
            [
                'plate_number' => '45-B-11982',
                'model' => 'Hyundai H350 2.5T',
                'vehicle_type' => 'Fourgonnette',
                'capacity' => '2.5 T / Vente directe embarquée',
                'warehouse_id' => $casa?->id,
                'driver_name' => 'Hamid El Meskini',
                'mileage' => 29400,
                'technical_visit_expiry' => '2027-08-10',
                'insurance_expiry' => '2027-05-20',
                'status' => 'en_mission',
            ],
        ];

        foreach ($fleetData as $fl) {
            $driver = $drivers->get($fl['driver_name']);
            Vehicle::updateOrCreate(
                ['plate_number' => $fl['plate_number']],
                [
                    'model' => $fl['model'],
                    'vehicle_type' => $fl['vehicle_type'],
                    'capacity' => $fl['capacity'],
                    'warehouse_id' => $fl['warehouse_id'],
                    'driver_id' => $driver?->id,
                    'mileage' => $fl['mileage'],
                    'technical_visit_expiry' => $fl['technical_visit_expiry'],
                    'insurance_expiry' => $fl['insurance_expiry'],
                    'status' => $fl['status'],
                ]
            );
        }

        // ---------------------------------------------------------------------
        // 3. Bons d'Achat Fournisseurs (Purchase Orders)
        // ---------------------------------------------------------------------
        $lesieur = $suppliers->get('FRN-002') ?? Supplier::first();
        $cosumar = $suppliers->get('FRN-001') ?? Supplier::first();

        if ($lesieur && $casa) {
            $po1 = PurchaseOrder::updateOrCreate(
                ['ref' => 'BC-2026-042'],
                [
                    'supplier_id' => $lesieur->id,
                    'warehouse_id' => $casa->id,
                    'user_id' => $superAdmin?->id,
                    'order_date' => '2026-10-01',
                    'expected_date' => '2026-10-06',
                    'total_ht' => 148333.33,
                    'tva_rate' => 20.00,
                    'vat_amount' => 29666.67,
                    'total_ttc' => 178000.00,
                    'status' => 'En transit',
                    'payment_terms' => 'Traite 60j fin de mois',
                    'notes' => 'Livraison directe quai numéro 2 Ain Sebaâ',
                ]
            );

            $p1 = $products->first();
            if ($p1) {
                PurchaseOrderItem::updateOrCreate(
                    ['purchase_order_id' => $po1->id, 'product_id' => $p1->id],
                    [
                        'quantity_ordered' => 500,
                        'quantity_received' => 0,
                        'unit_price' => 220.00,
                        'unit' => 'Bidon 5L',
                        'total' => 110000.00,
                    ]
                );
            }
        }

        if ($cosumar && $casa) {
            $po2 = PurchaseOrder::updateOrCreate(
                ['ref' => 'BC-2026-041'],
                [
                    'supplier_id' => $cosumar->id,
                    'warehouse_id' => $casa->id,
                    'user_id' => $superAdmin?->id,
                    'order_date' => '2026-09-28',
                    'expected_date' => '2026-10-03',
                    'total_ht' => 87500.00,
                    'tva_rate' => 20.00,
                    'vat_amount' => 17500.00,
                    'total_ttc' => 105000.00,
                    'status' => 'Reçu',
                    'payment_terms' => 'Virement bancaire 30j',
                    'notes' => 'Conforme aux normes ONSSA',
                ]
            );

            // Bon de Réception correspondant
            $rec1 = PurchaseReceipt::updateOrCreate(
                ['ref' => 'BR-2026-015'],
                [
                    'purchase_order_id' => $po2->id,
                    'supplier_id' => $cosumar->id,
                    'warehouse_id' => $casa->id,
                    'received_by_user_id' => $superAdmin?->id,
                    'supplier_bl_ref' => 'BL-COSUMAR-9982',
                    'receipt_date' => '2026-10-03',
                    'status' => 'Conforme',
                    'notes' => 'Lot vérifié, température et emballages intacts.',
                ]
            );

            $p2 = $products->skip(1)->first() ?? $products->first();
            if ($p2) {
                PurchaseReceiptItem::updateOrCreate(
                    ['purchase_receipt_id' => $rec1->id, 'product_id' => $p2->id],
                    [
                        'lot_number' => 'LOT-COS-2026-9',
                        'expiry_date' => '2027-10-01',
                        'quantity_ordered' => 200,
                        'quantity_received' => 200,
                        'quantity_accepted' => 200,
                        'quantity_rejected' => 0,
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 4. Transferts Inter-Dépôts (Stock Transfers)
        // ---------------------------------------------------------------------
        $driverNavette = $drivers->get('Youssef Berrada') ?? Driver::where('driver_type', 'depot_to_depot')->first();
        if ($casa && $rabat) {
            $trf = StockTransfer::updateOrCreate(
                ['ref' => 'TRF-0012'],
                [
                    'source_warehouse_id' => $casa->id,
                    'destination_warehouse_id' => $rabat->id,
                    'driver_id' => $driverNavette?->id,
                    'vehicle_plate' => '14-A-87654',
                    'created_by_user_id' => $superAdmin?->id,
                    'validated_by_user_id' => $superAdmin?->id,
                    'status' => 'en_transit',
                    'departure_date' => now()->subHours(2),
                    'notes' => 'Réassort régulier Rabat (Ligne 1 Navette inter-dépôts)',
                ]
            );

            $pCut = $products->get('CUT-230D') ?? $products->first();
            if ($pCut) {
                StockTransferItem::updateOrCreate(
                    ['stock_transfer_id' => $trf->id, 'product_id' => $pCut->id],
                    [
                        'quantity_sent' => 16,
                        'quantity_received' => 0,
                        'lot_number' => 'LOT-2024-890',
                        'unit_cost' => 189.50,
                        'notes' => '16 disques diamant transférés vers Rabat',
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 5. Préparation & Picking (Picking Lists)
        // ---------------------------------------------------------------------
        $sampleOrder = Order::first();
        if ($sampleOrder && $casa) {
            $picking = PickingList::updateOrCreate(
                ['ref' => 'PC-2026-088'],
                [
                    'order_id' => $sampleOrder->id,
                    'warehouse_id' => $casa->id,
                    'preparator_id' => $superAdmin?->id,
                    'status' => 'en_cours',
                    'started_at' => now()->subMinutes(45),
                    'notes' => 'Commande prioritaire expédition 14h',
                ]
            );

            foreach ($sampleOrder->items as $idx => $item) {
                PickingItem::updateOrCreate(
                    ['picking_list_id' => $picking->id, 'product_id' => $item->product_id],
                    [
                        'location_bin' => 'Allée ' . chr(65 + ($idx % 4)) . ' · Rayon 0' . ($idx + 1) . ' · Niv ' . (($idx % 3) + 1),
                        'requested_quantity' => $item->quantity,
                        'prepared_quantity' => max(0, $item->quantity - ($idx === 1 ? 2 : 0)),
                        'scanned_barcode' => $item->product?->barcode ?? '611' . rand(1000000000, 9999999999),
                        'status' => $idx === 1 ? 'short' : 'ok',
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 6. Tournées de Livraison (Delivery Tours & Stops)
        // ---------------------------------------------------------------------
        $driverTour = $drivers->get('Mehdi Lahlou') ?? Driver::where('driver_type', 'depot_to_client')->first();
        if ($driverTour && $casa) {
            $tour = DeliveryTour::updateOrCreate(
                ['ref' => 'TRN-2026-08'],
                [
                    'driver_id' => $driverTour->id,
                    'warehouse_id' => $casa->id,
                    'vehicle_plate' => '23-A-54321',
                    'tour_date' => now()->toDateString(),
                    'route_name' => 'Grand Casablanca & Ain Sebaâ',
                    'total_stops' => 3,
                    'completed_stops' => 1,
                    'total_amount_to_collect' => 75380.50,
                    'total_amount_collected' => 32100.00,
                    'status' => 'en_cours',
                    'departure_time' => now()->subHours(3),
                    'notes' => 'Tournée matinale centres commerciaux & chantiers',
                ]
            );

            $cAmal = $customers->get('CLI-003') ?? Customer::first();
            $cBati = $customers->get('CLI-002') ?? Customer::skip(1)->first();
            $cAtlas = $customers->get('CLI-001') ?? Customer::skip(2)->first();

            if ($cAmal) {
                DeliveryTourStop::updateOrCreate(
                    ['delivery_tour_id' => $tour->id, 'stop_order' => 1],
                    [
                        'customer_id' => $cAmal->id,
                        'address' => '45, Rue des Selliers, Medina',
                        'city' => 'Fès',
                        'amount_to_collect' => 32100.00,
                        'amount_collected' => 32100.00,
                        'payment_method' => 'cheque',
                        'cheque_number' => 'CHQ-849301',
                        'cheque_bank' => 'Attijariwafa Bank',
                        'receiver_name' => 'Mohamed Fassi',
                        'status' => 'delivered',
                        'delivered_at' => now()->subHours(1),
                    ]
                );
            }

            if ($cBati) {
                DeliveryTourStop::updateOrCreate(
                    ['delivery_tour_id' => $tour->id, 'stop_order' => 2],
                    [
                        'customer_id' => $cBati->id,
                        'address' => 'Lot 14, Zone Industrielle Takaddoum',
                        'city' => 'Rabat',
                        'amount_to_collect' => 18420.50,
                        'amount_collected' => 0.00,
                        'status' => 'in_route',
                    ]
                );
            }

            if ($cAtlas) {
                DeliveryTourStop::updateOrCreate(
                    ['delivery_tour_id' => $tour->id, 'stop_order' => 3],
                    [
                        'customer_id' => $cAtlas->id,
                        'address' => '12, Boulevard Zerktouni',
                        'city' => 'Casablanca',
                        'amount_to_collect' => 24860.00,
                        'amount_collected' => 0.00,
                        'status' => 'pending',
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 7. Bons de Livraison Officiels (Delivery Slips / BL)
        // ---------------------------------------------------------------------
        if ($sampleOrder && $sampleOrder->customer && $casa) {
            $bl = DeliverySlip::updateOrCreate(
                ['ref' => 'BL-2025-084'],
                [
                    'order_id' => $sampleOrder->id,
                    'customer_id' => $sampleOrder->customer_id,
                    'warehouse_id' => $casa->id,
                    'driver_id' => $driverTour?->id,
                    'delivery_date' => now()->toDateString(),
                    'total_ht' => $sampleOrder->total * 0.8333,
                    'total_tva' => $sampleOrder->total * 0.1667,
                    'total_ttc' => $sampleOrder->total,
                    'status' => 'valide',
                    'receiver_name' => $sampleOrder->customer->name,
                    'notes' => 'Marchandise vérifiée et réceptionnée conforme.',
                ]
            );

            foreach ($sampleOrder->items as $item) {
                DeliverySlipItem::updateOrCreate(
                    ['delivery_slip_id' => $bl->id, 'product_id' => $item->product_id],
                    [
                        'quantity_ordered' => $item->quantity,
                        'quantity_delivered' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total' => $item->total,
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 8. Lignes de Factures (Invoice Items)
        // ---------------------------------------------------------------------
        $invoices = Invoice::all();
        foreach ($invoices as $inv) {
            if ($inv->items()->count() === 0 && $inv->order) {
                foreach ($inv->order->items as $item) {
                    InvoiceItem::create([
                        'invoice_id' => $inv->id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_ht' => $item->total * 0.8333,
                        'tva_rate' => 20.00,
                        'total_ttc' => $item->total,
                    ]);
                }
            }
        }

        // ---------------------------------------------------------------------
        // 9. Factures d'Avoir / Credit Notes (AVR)
        // ---------------------------------------------------------------------
        $sampleInvoice = Invoice::first();
        if ($sampleInvoice && $sampleInvoice->customer) {
            $creditNote = CreditNote::updateOrCreate(
                ['ref' => 'AVR-2025-42'],
                [
                    'invoice_id' => $sampleInvoice->id,
                    'customer_id' => $sampleInvoice->customer_id,
                    'user_id' => $superAdmin?->id,
                    'date_issued' => '2025-02-28',
                    'reason' => 'Retour de marchandise',
                    'total_ht' => 1500.00,
                    'tva_rate' => 20.00,
                    'total_ttc' => 1800.00,
                    'status' => 'Émis',
                    'notes' => 'Retour partiel de 2 articles défectueux avec PV de contrôle',
                ]
            );

            $pFirst = $products->first();
            if ($pFirst) {
                CreditNoteItem::updateOrCreate(
                    ['credit_note_id' => $creditNote->id, 'product_id' => $pFirst->id],
                    [
                        'quantity' => 2,
                        'unit_price' => 750.00,
                        'total' => 1500.00,
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 10. Lignes de Retours (Return Items)
        // ---------------------------------------------------------------------
        $returns = ProductReturn::all();
        foreach ($returns as $ret) {
            if ($ret->items()->count() === 0 && $ret->product_id) {
                ReturnItem::create([
                    'return_id' => $ret->id,
                    'product_id' => $ret->product_id,
                    'quantity' => $ret->quantity,
                    'unit_price' => $ret->quantity > 0 ? $ret->amount / $ret->quantity : 0.00,
                    'total' => $ret->amount,
                    'reintegrate_stock' => $ret->restock_approved,
                    'reason_detail' => $ret->reason,
                ]);
            }
        }

        // ---------------------------------------------------------------------
        // 11. Clôtures de Caisse (Cash Closings)
        // ---------------------------------------------------------------------
        if ($casa && $superAdmin) {
            CashClosing::updateOrCreate(
                ['ref' => 'CLT-2026-0045'],
                [
                    'warehouse_id' => $casa->id,
                    'closed_by_user_id' => $superAdmin->id,
                    'closing_date' => now()->toDateString(),
                    'cash_theoretical' => 14500.00,
                    'cash_counted' => 14500.00,
                    'cash_difference' => 0.00,
                    'cheques_count' => 6,
                    'cheques_total' => 78400.00,
                    'effects_count' => 2,
                    'effects_total' => 16015.00,
                    'total_collected' => 108915.00,
                    'status' => 'valide_depot',
                    'justification_notes' => 'Caisse parfaitement équilibrée. Chèques et effets mis sous coffre fort.',
                    'validated_by_user_id' => $superAdmin->id,
                    'validated_at' => now(),
                ]
            );
        }

        // ---------------------------------------------------------------------
        // 12. Chèques & Effets en Portefeuille (Cheques & Effects in Hand)
        // ---------------------------------------------------------------------
        $cAtlasItem = $customers->get('CLI-001') ?? Customer::first();
        $chequesData = [
            [
                'ref' => 'CHQ-084731',
                'customer_id' => $cAtlasItem?->id,
                'bank' => 'Banque Populaire',
                'amount' => 12500.00,
                'due_date' => '2025-03-05',
                'doc_type' => 'cheque',
                'status' => 'en_portefeuille',
            ],
            [
                'ref' => 'EFF-006841',
                'customer_id' => $cAtlasItem?->id,
                'bank' => 'BMCI',
                'amount' => 9735.00,
                'due_date' => '2025-03-18',
                'doc_type' => 'effet',
                'status' => 'en_portefeuille',
            ],
            [
                'ref' => 'CHQ-849301',
                'customer_id' => $customers->get('CLI-003')?->id ?? $cAtlasItem?->id,
                'bank' => 'Attijariwafa Bank',
                'amount' => 32100.00,
                'due_date' => '2025-02-28',
                'doc_type' => 'cheque',
                'status' => 'remis_en_banque',
                'remittance_ref' => 'BR-AWB-2025-014',
            ],
            [
                'ref' => 'EFF-004412',
                'customer_id' => $customers->get('CLI-002')?->id ?? $cAtlasItem?->id,
                'bank' => 'Société Générale Maroc',
                'amount' => 6280.00,
                'due_date' => '2025-02-20',
                'doc_type' => 'effet',
                'status' => 'encaisse',
            ],
            [
                'ref' => 'CHQ-001298',
                'customer_id' => $cAtlasItem?->id,
                'bank' => 'CIH Bank',
                'amount' => 14500.00,
                'due_date' => '2025-02-15',
                'doc_type' => 'cheque',
                'status' => 'impaye',
                'notes' => 'Rejet pour provision insuffisante - Relance contentieux effectuée',
            ],
        ];

        foreach ($chequesData as $chq) {
            if ($chq['customer_id']) {
                ChequeInHand::updateOrCreate(
                    ['ref' => $chq['ref']],
                    [
                        'customer_id' => $chq['customer_id'],
                        'warehouse_id' => $casa?->id,
                        'bank' => $chq['bank'],
                        'amount' => $chq['amount'],
                        'due_date' => $chq['due_date'],
                        'doc_type' => $chq['doc_type'],
                        'status' => $chq['status'],
                        'remittance_ref' => $chq['remittance_ref'] ?? null,
                        'notes' => $chq['notes'] ?? null,
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 13. Mouvements de Stock (Stock Ledger History)
        // ---------------------------------------------------------------------
        if ($casa && $superAdmin) {
            $movements = [
                [
                    'movement_type' => 'reception_achat',
                    'reference_doc' => 'ACH-0097',
                    'quantity' => 24,
                    'sku' => 'HRC-0850',
                    'reason' => 'Réception commande fournisseur Lesieur',
                ],
                [
                    'movement_type' => 'livraison_client',
                    'reference_doc' => 'CMD-2406',
                    'quantity' => -3,
                    'sku' => 'PMP-15HP',
                    'reason' => 'Réservation et expédition commande client',
                ],
                [
                    'movement_type' => 'transfert_sortie',
                    'reference_doc' => 'TRF-0012',
                    'quantity' => -16,
                    'sku' => 'CUT-230D',
                    'reason' => 'Sortie transfert Casa → Rabat',
                ],
                [
                    'movement_type' => 'ajustement_inventaire',
                    'reference_doc' => 'INV-0225',
                    'quantity' => 5,
                    'sku' => 'CAB-3G25',
                    'reason' => 'Écart d\'inventaire physique positif régularisé',
                ],
            ];

            foreach ($movements as $m) {
                $p = $products->get($m['sku']) ?? $products->first();
                if ($p) {
                    StockMovement::updateOrCreate(
                        ['reference_doc' => $m['reference_doc'], 'product_id' => $p->id],
                        [
                            'warehouse_id' => $casa->id,
                            'user_id' => $superAdmin->id,
                            'movement_type' => $m['movement_type'],
                            'quantity' => $m['quantity'],
                            'previous_stock' => 100,
                            'new_stock' => 100 + $m['quantity'],
                            'unit_cost' => $p->price,
                            'reason' => $m['reason'],
                        ]
                    );
                }
            }
        }

        // ---------------------------------------------------------------------
        // 14. Sessions d'Inventaire Physique (Inventory Audits)
        // ---------------------------------------------------------------------
        if ($casa && $superAdmin) {
            $invAudit = InventoryAudit::updateOrCreate(
                ['ref' => 'INV-2026-03'],
                [
                    'warehouse_id' => $casa->id,
                    'audited_by_user_id' => $superAdmin->id,
                    'audit_date' => now()->toDateString(),
                    'status' => 'valide',
                    'total_items_counted' => 45,
                    'total_discrepancies' => 2,
                    'notes' => 'Inventaire mensuel clôturé sans anomalies critiques.',
                ]
            );

            $pList = $products->take(3);
            foreach ($pList as $idx => $p) {
                InventoryAuditItem::updateOrCreate(
                    ['inventory_audit_id' => $invAudit->id, 'product_id' => $p->id],
                    [
                        'system_quantity' => 50,
                        'counted_quantity' => 50 + ($idx === 1 ? -1 : ($idx === 2 ? 1 : 0)),
                        'difference_quantity' => ($idx === 1 ? -1 : ($idx === 2 ? 1 : 0)),
                        'unit_cost' => $p->price,
                        'total_variance_value' => ($idx === 1 ? -1 : ($idx === 2 ? 1 : 0)) * $p->price,
                        'status' => $idx === 0 ? 'conforme' : 'ecart_justifie',
                    ]
                );
            }
        }
    }
}
