<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Customer portal authentication + rich profile.
        Schema::table('customers', function (Blueprint $table) {
            $table->string('email')->nullable()->unique()->after('phone');
            $table->string('password')->nullable()->after('email');
            $table->string('company')->nullable()->after('name');
            $table->string('address')->nullable()->after('city');
            $table->decimal('lat', 10, 7)->nullable()->after('address');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
            $table->foreignId('commercial_id')->nullable()->after('lng')
                ->constrained('users')->nullOnDelete();
            $table->string('locale', 5)->default('fr')->after('price_tier');
            $table->rememberToken()->after('status');
        });

        // Price grid: a product price can vary per customer price_tier.
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('tier');           // standard, revendeur, grossiste, chantier...
            $table->decimal('price', 12, 2);  // unit price HT for this tier
            $table->timestamps();
            $table->unique(['product_id', 'tier']);
        });

        // Product imagery + customer-portal visibility.
        Schema::table('products', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->string('image')->nullable()->after('description');
            $table->string('unit')->default('Pièce')->after('packaging');
            $table->boolean('visible_portal')->default(true)->after('status');
            $table->integer('min_order_qty')->default(1)->after('visible_portal');
        });

        // Customer order portal fields.
        Schema::table('orders', function (Blueprint $table) {
            $table->date('desired_date')->nullable()->after('date');
            $table->text('delivery_note')->nullable()->after('desired_date');
            $table->decimal('discount', 12, 2)->default(0.00)->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['desired_date', 'delivery_note', 'discount']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['description', 'image', 'unit', 'visible_portal', 'min_order_qty']);
        });

        Schema::dropIfExists('product_prices');

        Schema::table('customers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('commercial_id');
            $table->dropColumn(['email', 'password', 'company', 'address', 'lat', 'lng', 'locale', 'remember_token']);
        });
    }
};
