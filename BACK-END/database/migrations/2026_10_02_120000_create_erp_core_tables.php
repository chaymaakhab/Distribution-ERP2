<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('permissions')->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('city');
            $table->string('address')->nullable();
            $table->timestamps();
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('city');
            $table->string('phone')->nullable();
            $table->string('price_tier')->default('standard');
            $table->decimal('credit_limit', 12, 2)->default(0.00);
            $table->string('status')->default('Actif');
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('sku')->unique();
            $table->decimal('price', 10, 2);
            $table->integer('vat_rate')->default(20);
            $table->string('packaging')->default('Pièce');
            $table->string('status')->default('Actif');
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->string('city');
            $table->string('date');
            $table->decimal('total', 12, 2);
            $table->string('status')->default('À valider');
            $table->string('source')->default('Commercial');
            $table->string('client_generated_uuid')->nullable()->unique();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->unique();
            $table->foreignId('order_id')->nullable()->constrained('orders');
            $table->string('tour_name');
            $table->string('driver_name');
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('En route');
            $table->timestamps();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->unique();
            $table->foreignId('order_id')->nullable()->constrained('orders');
            $table->foreignId('customer_id')->constrained('customers');
            $table->decimal('total_ttc', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0.00);
            $table->string('status')->default('Impayée');
            $table->string('due_date');
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->string('method'); // Cash, Check, Wire, Effect
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('En caisse');
            $table->timestamps();
        });

        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('client_generated_uuid')->unique();
            $table->string('action');
            $table->string('status'); // applied, duplicate, conflict
            $table->json('response_payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('roles');
    }
};
