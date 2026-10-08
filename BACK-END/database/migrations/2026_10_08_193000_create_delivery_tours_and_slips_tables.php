<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tournées de Livraison (Delivery Tours / TRN)
        if (!Schema::hasTable('delivery_tours')) {
            Schema::create('delivery_tours', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // TRN-2026-08
                $table->foreignId('driver_id')->constrained('drivers');
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->string('vehicle_plate', 30)->nullable();
                $table->date('tour_date');
                $table->string('route_name')->nullable();
                $table->integer('total_stops')->default(0);
                $table->integer('completed_stops')->default(0);
                $table->decimal('total_amount_to_collect', 14, 2)->default(0.00);
                $table->decimal('total_amount_collected', 14, 2)->default(0.00);
                $table->string('status', 40)->default('planifiee'); // planifiee, en_cours, terminee, cloturee
                $table->timestamp('departure_time')->nullable();
                $table->timestamp('return_time')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 2. Points d'Arrêt de la Tournée (Delivery Tour Stops)
        if (!Schema::hasTable('delivery_tour_stops')) {
            Schema::create('delivery_tour_stops', function (Blueprint $table) {
                $table->id();
                $table->foreignId('delivery_tour_id')->constrained('delivery_tours')->cascadeOnDelete();
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->foreignId('customer_id')->constrained('customers');
                $table->integer('stop_order')->default(1);
                $table->string('address');
                $table->string('city', 100);
                $table->decimal('amount_to_collect', 14, 2)->default(0.00);
                $table->decimal('amount_collected', 14, 2)->default(0.00);
                $table->string('payment_method', 30)->nullable(); // especes, cheque
                $table->string('cheque_number', 50)->nullable();
                $table->string('cheque_bank', 100)->nullable();
                $table->string('receiver_name', 100)->nullable();
                $table->longText('signature')->nullable();
                $table->string('proof_photo')->nullable();
                $table->string('status', 40)->default('pending'); // pending, in_route, arrived, delivered, partially_delivered, absent, refused
                $table->text('failed_reason')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamps();
            });
        }

        // 3. Bons de Livraison Officiels (Delivery Slips / BL)
        if (!Schema::hasTable('delivery_slips')) {
            Schema::create('delivery_slips', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // BL-2025-084
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->foreignId('customer_id')->constrained('customers');
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
                $table->date('delivery_date');
                $table->decimal('total_ht', 14, 2)->default(0.00);
                $table->decimal('total_tva', 14, 2)->default(0.00);
                $table->decimal('total_ttc', 14, 2)->default(0.00);
                $table->string('status', 40)->default('valide'); // brouillon, valide, en_cours, livre
                $table->string('receiver_name', 100)->nullable();
                $table->longText('signature')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 4. Lignes du Bon de Livraison (Delivery Slip Items)
        if (!Schema::hasTable('delivery_slip_items')) {
            Schema::create('delivery_slip_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('delivery_slip_id')->constrained('delivery_slips')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity_ordered')->default(1);
                $table->integer('quantity_delivered')->default(1);
                $table->decimal('unit_price', 12, 2)->default(0.00);
                $table->decimal('total', 14, 2)->default(0.00);
                $table->string('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_slip_items');
        Schema::dropIfExists('delivery_slips');
        Schema::dropIfExists('delivery_tour_stops');
        Schema::dropIfExists('delivery_tours');
    }
};
