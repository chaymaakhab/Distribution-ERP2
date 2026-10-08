<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Bons de Préparation / Picking Lists (PC)
        if (!Schema::hasTable('picking_lists')) {
            Schema::create('picking_lists', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // PC-2026-088
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('preparator_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status', 40)->default('a_preparer'); // a_preparer, en_cours, termine, partiel, anomalie
                $table->timestamp('started_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 2. Lignes de Picking (Scanning & Emplacement)
        if (!Schema::hasTable('picking_items')) {
            Schema::create('picking_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('picking_list_id')->constrained('picking_lists')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->string('location_bin', 100)->nullable(); // Allée A · Rayon 03 · Niv 2
                $table->integer('requested_quantity')->default(1);
                $table->integer('prepared_quantity')->default(0);
                $table->string('scanned_barcode', 50)->nullable();
                $table->string('status', 30)->default('pending'); // pending, ok, short
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('picking_items');
        Schema::dropIfExists('picking_lists');
    }
};
