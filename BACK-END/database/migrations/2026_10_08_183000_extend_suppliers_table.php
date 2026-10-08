<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'contact')) {
                $table->string('contact')->nullable()->after('name');
            }
            if (!Schema::hasColumn('suppliers', 'email')) {
                $table->string('email')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('suppliers', 'address')) {
                $table->string('address')->nullable()->after('city');
            }
            if (!Schema::hasColumn('suppliers', 'ice')) {
                $table->string('ice', 15)->nullable()->after('address');
            }
            if (!Schema::hasColumn('suppliers', 'rc')) {
                $table->string('rc', 50)->nullable()->after('ice');
            }
            if (!Schema::hasColumn('suppliers', 'products_count')) {
                $table->integer('products_count')->default(0)->after('rc');
            }
            if (!Schema::hasColumn('suppliers', 'last_order')) {
                $table->string('last_order')->nullable()->after('products_count');
            }
            if (!Schema::hasColumn('suppliers', 'total_purchases')) {
                $table->decimal('total_purchases', 14, 2)->default(0.00)->after('last_order');
            }
            if (!Schema::hasColumn('suppliers', 'status')) {
                $table->string('status', 30)->default('Actif')->after('total_purchases');
            }
            if (!Schema::hasColumn('suppliers', 'categories')) {
                $table->json('categories')->nullable()->after('status');
            }
            if (!Schema::hasColumn('suppliers', 'payment_terms')) {
                $table->string('payment_terms')->nullable()->after('categories');
            }
            if (!Schema::hasColumn('suppliers', 'lead_time_days')) {
                $table->integer('lead_time_days')->default(3)->after('payment_terms');
            }
        });
    }

    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn([
                'contact', 'email', 'address', 'ice', 'rc',
                'products_count', 'last_order', 'total_purchases',
                'status', 'categories', 'payment_terms', 'lead_time_days',
            ]);
        });
    }
};
