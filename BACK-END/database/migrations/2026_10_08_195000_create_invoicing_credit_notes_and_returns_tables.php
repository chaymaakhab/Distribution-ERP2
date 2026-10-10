<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend invoices table with fiscal fields
        Schema::table('invoices', function (Blueprint $table) {
            if (!Schema::hasColumn('invoices', 'warehouse_id')) {
                $table->foreignId('warehouse_id')->nullable()->after('customer_id')->constrained('warehouses')->nullOnDelete();
            }
            if (!Schema::hasColumn('invoices', 'total_ht')) {
                $table->decimal('total_ht', 14, 2)->default(0.00)->after('warehouse_id');
            }
            if (!Schema::hasColumn('invoices', 'tva_rate')) {
                $table->decimal('tva_rate', 5, 2)->default(20.00)->after('total_ht');
            }
            if (!Schema::hasColumn('invoices', 'tva_amount')) {
                $table->decimal('tva_amount', 14, 2)->default(0.00)->after('tva_rate');
            }
            if (!Schema::hasColumn('invoices', 'timbre_fiscal')) {
                $table->decimal('timbre_fiscal', 10, 2)->default(0.00)->after('total_ttc');
            }
            if (!Schema::hasColumn('invoices', 'payment_method')) {
                $table->string('payment_method', 100)->nullable()->after('timbre_fiscal');
            }
            if (!Schema::hasColumn('invoices', 'notes')) {
                $table->text('notes')->nullable()->after('due_date');
            }
        });

        // 2. Lignes de Facture (Invoice Items)
        if (!Schema::hasTable('invoice_items')) {
            Schema::create('invoice_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 12, 2)->default(0.00);
                $table->decimal('total_ht', 14, 2)->default(0.00);
                $table->decimal('tva_rate', 5, 2)->default(20.00);
                $table->decimal('total_ttc', 14, 2)->default(0.00);
                $table->timestamps();
            });
        }

        // 3. Factures d'Avoir / Credit Notes (Bons d'Avoir / AVR)
        if (!Schema::hasTable('credit_notes')) {
            Schema::create('credit_notes', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // AVR-2025-42
                $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
                $table->foreignId('return_id')->nullable()->constrained('returns')->nullOnDelete();
                $table->foreignId('customer_id')->constrained('customers');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->date('date_issued');
                $table->string('reason', 150)->default('Retour de marchandise');
                $table->decimal('total_ht', 14, 2)->default(0.00);
                $table->decimal('tva_rate', 5, 2)->default(20.00);
                $table->decimal('total_ttc', 14, 2)->default(0.00);
                $table->string('status', 40)->default('Émis'); // Brouillon, Émis, Appliqué, Remboursé
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 4. Lignes d'Avoir (Credit Note Items)
        if (!Schema::hasTable('credit_note_items')) {
            Schema::create('credit_note_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('credit_note_id')->constrained('credit_notes')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 12, 2)->default(0.00);
                $table->decimal('total', 14, 2)->default(0.00);
                $table->timestamps();
            });
        }

        // 5. Lignes de Retour Multi-articles (Return Items)
        if (!Schema::hasTable('return_items')) {
            Schema::create('return_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('return_id')->constrained('returns')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 12, 2)->default(0.00);
                $table->decimal('total', 14, 2)->default(0.00);
                $table->boolean('reintegrate_stock')->default(false);
                $table->string('reason_detail')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('return_items');
        Schema::dropIfExists('credit_note_items');
        Schema::dropIfExists('credit_notes');
        Schema::dropIfExists('invoice_items');
    }
};
