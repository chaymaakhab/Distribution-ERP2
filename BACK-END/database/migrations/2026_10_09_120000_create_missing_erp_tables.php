<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. ERP User & System Notifications
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
                $table->string('type', 40)->default('alert'); // alert, operation, financial, delivery
                $table->string('title');
                $table->text('message');
                $table->boolean('read')->default(false);
                $table->string('segment', 50)->default('general'); // inventory, orders, finance, deliveries, purchasing, general
                $table->string('link')->nullable();
                $table->timestamps();
            });
        }

        // 2. Commercial Visits (Tournées commerciales & Visites clients terrain)
        if (!Schema::hasTable('commercial_visits')) {
            Schema::create('commercial_visits', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // VIS-2026-001
                $table->foreignId('commercial_id')->constrained('users');
                $table->foreignId('customer_id')->constrained('customers');
                $table->date('visit_date');
                $table->string('visit_type', 50)->default('prospection'); // prospection, prise_commande, recouvrement, fidelisation, litige
                $table->string('status', 40)->default('planifiee'); // planifiee, en_cours, realisee, annulee
                $table->decimal('checkin_lat', 10, 7)->nullable();
                $table->decimal('checkin_lng', 10, 7)->nullable();
                $table->timestamp('checkin_time')->nullable();
                $table->timestamp('checkout_time')->nullable();
                $table->decimal('amount_collected', 12, 2)->default(0.00);
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->string('next_action')->nullable();
                $table->date('next_visit_date')->nullable();
                $table->timestamps();
            });
        }

        // 3. Commercial Promotions & Discount Campaigns
        if (!Schema::hasTable('promotions')) {
            Schema::create('promotions', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique(); // PROMO-RAMADAN-26
                $table->string('name');
                $table->string('type', 30)->default('percentage'); // percentage, fixed_amount
                $table->decimal('discount_value', 10, 2);
                $table->decimal('min_order_amount', 12, 2)->default(0.00);
                $table->date('start_date');
                $table->date('end_date');
                $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->string('customer_tier', 50)->nullable(); // standard, silver, gold, vip
                $table->string('status', 30)->default('Actif'); // Actif, Inactif, Expire
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('commercial_visits');
        Schema::dropIfExists('notifications');
    }
};
