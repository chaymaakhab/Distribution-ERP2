<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mouvements de Stock (Stock Ledger / Movements History)
        if (!Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products');
                $table->foreignId('warehouse_id')->constrained('warehouses');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('movement_type', 50); // reception_achat, livraison_client, transfert_sortie, transfert_entree, retour_client, ajustement_inventaire, rebut
                $table->string('reference_doc', 50); // ACH-0097, CMD-2406, TRF-0012, INV-0225, RET-2026-018
                $table->integer('quantity'); // Signed (+/-)
                $table->integer('previous_stock')->default(0);
                $table->integer('new_stock')->default(0);
                $table->decimal('unit_cost', 12, 2)->default(0.00);
                $table->string('lot_number', 50)->nullable();
                $table->string('reason')->nullable();
                $table->timestamps();
            });
        }

        // 2. Sessions d'Inventaire Physique (Inventory Audits / Sessions)
        if (!Schema::hasTable('inventory_audits')) {
            Schema::create('inventory_audits', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // INV-2026-03
                $table->foreignId('warehouse_id')->constrained('warehouses');
                $table->foreignId('audited_by_user_id')->constrained('users');
                $table->date('audit_date');
                $table->string('status', 40)->default('en_cours'); // en_cours, valide, annule
                $table->integer('total_items_counted')->default(0);
                $table->integer('total_discrepancies')->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 3. Lignes d'Inventaire (Inventory Audit Items)
        if (!Schema::hasTable('inventory_audit_items')) {
            Schema::create('inventory_audit_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventory_audit_id')->constrained('inventory_audits')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->string('lot_number', 50)->nullable();
                $table->integer('system_quantity')->default(0);
                $table->integer('counted_quantity')->default(0);
                $table->integer('difference_quantity')->default(0);
                $table->decimal('unit_cost', 12, 2)->default(0.00);
                $table->decimal('total_variance_value', 14, 2)->default(0.00);
                $table->string('status', 40)->default('conforme'); // conforme, ecart_justifie, ecart_non_justifie
                $table->timestamps();
            });
        }

        // 4. Paramètres de l'Entreprise et Données Fiscales Marocaines (Company Legal & Fiscal Info)
        if (!Schema::hasTable('company_settings')) {
            Schema::create('company_settings', function (Blueprint $table) {
                $table->id();
                $table->string('company_name', 150)->default('DISTRI-MAROC LOGISTIQUE SARL');
                $table->string('brand_name', 150)->nullable()->default('Atlas Distribution');
                $table->string('ice', 15)->default('002874195000038'); // ICE obligatoire 15 chiffres
                $table->string('rc', 50)->default('54210 Casablanca');
                $table->string('if_tax', 50)->default('40192837');
                $table->string('patente', 50)->nullable()->default('38291045');
                $table->string('cnss', 50)->nullable()->default('7819203');
                $table->decimal('capital', 14, 2)->default(5000000.00);
                $table->string('address')->default('Zone Industrielle Ain Sebaâ, Route 110');
                $table->string('city', 100)->default('Casablanca');
                $table->string('phone', 50)->default('+212 522 35 44 00');
                $table->string('email', 100)->default('contact@atlasdistribution.ma');
                $table->string('website', 150)->nullable()->default('https://atlasdistribution.ma');
                $table->string('bank_name', 100)->nullable()->default('Attijariwafa Bank');
                $table->string('rib', 50)->nullable()->default('007 780 0001234567890123 45');
                $table->string('swift', 30)->nullable()->default('BCMAMAMC');
                $table->string('logo_url')->nullable();
                $table->decimal('default_tva_rate', 5, 2)->default(20.00);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
        Schema::dropIfExists('inventory_audit_items');
        Schema::dropIfExists('inventory_audits');
        Schema::dropIfExists('stock_movements');
    }
};
