<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Warehouses become mappable and carry an operational status.
        Schema::table('warehouses', function (Blueprint $table) {
            $table->decimal('lat', 10, 7)->nullable()->after('address');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
            $table->string('phone')->nullable()->after('lng');
            $table->string('manager_name')->nullable()->after('phone');
            $table->string('status')->default('Actif')->after('manager_name');
        });

        // Attribute each order to a fulfilling depot and to the sales rep, so
        // revenue can be broken down per warehouse and per commercial.
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('customer_id')
                ->constrained('warehouses')->nullOnDelete();
            $table->foreignId('commercial_id')->nullable()->after('warehouse_id')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropConstrainedForeignId('commercial_id');
        });

        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng', 'phone', 'manager_name', 'status']);
        });
    }
};
