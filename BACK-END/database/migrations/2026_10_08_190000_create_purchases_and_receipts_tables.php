<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Bons d'Achat Fournisseurs (Purchase Orders)
        if (!Schema::hasTable('purchase_orders')) {
            Schema::create('purchase_orders', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // BC-2026-042
                $table->foreignId('supplier_id')->constrained('suppliers');
                $table->foreignId('warehouse_id')->constrained('warehouses');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->date('order_date');
                $table->date('expected_date')->nullable();
                $table->decimal('total_ht', 14, 2)->default(0.00);
                $table->decimal('tva_rate', 5, 2)->default(20.00);
                $table->decimal('vat_amount', 14, 2)->default(0.00);
                $table->decimal('total_ttc', 14, 2)->default(0.00);
                $table->string('status', 40)->default('Brouillon'); // Brouillon, Envoyé, Confirmé, En transit, Reçu, Annulé
                $table->string('payment_terms', 100)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 2. Lignes du Bon d'Achat (Purchase Order Lines)
        if (!Schema::hasTable('purchase_order_items')) {
            Schema::create('purchase_order_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity_ordered')->default(1);
                $table->integer('quantity_received')->default(0);
                $table->decimal('unit_price', 12, 2)->default(0.00);
                $table->string('unit', 50)->default('Pièce');
                $table->decimal('total', 14, 2)->default(0.00);
                $table->timestamps();
            });
        }

        // 3. Bons de Réception Fournisseur (Goods Receipt / BR)
        if (!Schema::hasTable('purchase_receipts')) {
            Schema::create('purchase_receipts', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // BR-2026-015
                $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
                $table->foreignId('supplier_id')->constrained('suppliers');
                $table->foreignId('warehouse_id')->constrained('warehouses');
                $table->foreignId('received_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('supplier_bl_ref', 100)->nullable(); // BL Fournisseur
                $table->date('receipt_date');
                $table->string('status', 40)->default('Conforme'); // Conforme, Avec réserves, Rejeté
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 4. Lignes du Bon de Réception
        if (!Schema::hasTable('purchase_receipt_items')) {
            Schema::create('purchase_receipt_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('purchase_receipt_id')->constrained('purchase_receipts')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->string('lot_number', 50)->nullable();
                $table->string('expiry_date', 30)->nullable();
                $table->integer('quantity_ordered')->default(0);
                $table->integer('quantity_received')->default(0);
                $table->integer('quantity_accepted')->default(0);
                $table->integer('quantity_rejected')->default(0);
                $table->string('rejection_reason')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_receipt_items');
        Schema::dropIfExists('purchase_receipts');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
