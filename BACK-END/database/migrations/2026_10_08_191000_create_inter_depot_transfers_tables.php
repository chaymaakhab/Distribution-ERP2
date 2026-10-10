<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Bons de Transfert Inter-Dépôts (Stock Transfers / TRF)
        if (!Schema::hasTable('stock_transfers')) {
            Schema::create('stock_transfers', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // TRF-2026-0012
                $table->foreignId('source_warehouse_id')->constrained('warehouses');
                $table->foreignId('destination_warehouse_id')->constrained('warehouses');
                $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
                $table->string('vehicle_plate', 30)->nullable();
                $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('validated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status', 40)->default('en_preparation'); // brouillon, en_preparation, en_transit, recu, annule
                $table->dateTime('departure_date')->nullable();
                $table->dateTime('arrival_date')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 2. Lignes du Transfert (Stock Transfer Items)
        if (!Schema::hasTable('stock_transfer_items')) {
            Schema::create('stock_transfer_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('stock_transfer_id')->constrained('stock_transfers')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity_sent')->default(1);
                $table->integer('quantity_received')->default(0);
                $table->string('lot_number', 50)->nullable();
                $table->decimal('unit_cost', 12, 2)->default(0.00);
                $table->string('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
    }
};
