<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend customers with Moroccan legal identifiers & balance tracking
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'ice')) {
                $table->string('ice', 15)->nullable()->after('company');
            }
            if (!Schema::hasColumn('customers', 'whatsapp')) {
                $table->string('whatsapp', 30)->nullable()->after('phone');
            }
            if (!Schema::hasColumn('customers', 'current_balance')) {
                $table->decimal('current_balance', 14, 2)->default(0.00)->after('credit_limit');
            }
            if (!Schema::hasColumn('customers', 'overdue_amount')) {
                $table->decimal('overdue_amount', 14, 2)->default(0.00)->after('current_balance');
            }
        });

        // 2. Extend products with barcode and purchase price
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'barcode')) {
                $table->string('barcode', 30)->nullable()->after('sku');
            }
            if (!Schema::hasColumn('products', 'purchase_price_ht')) {
                $table->decimal('purchase_price_ht', 12, 2)->default(0.00)->after('price');
            }
        });

        // 3. Extend stocks with lot details and unit price
        Schema::table('stocks', function (Blueprint $table) {
            if (!Schema::hasColumn('stocks', 'lot_number')) {
                $table->string('lot_number', 50)->nullable()->after('min_threshold');
            }
            if (!Schema::hasColumn('stocks', 'expiry_date')) {
                $table->string('expiry_date', 30)->nullable()->after('lot_number');
            }
            if (!Schema::hasColumn('stocks', 'unit_price')) {
                $table->decimal('unit_price', 12, 2)->default(0.00)->after('expiry_date');
            }
        });

        // 4. Extend payments table for Moroccan receipt vouchers (Bon d'encaissement)
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'receipt_number')) {
                $table->string('receipt_number', 50)->nullable()->unique()->after('ref');
            }
            if (!Schema::hasColumn('payments', 'bank')) {
                $table->string('bank', 100)->nullable()->after('method');
            }
            if (!Schema::hasColumn('payments', 'doc_number')) {
                $table->string('doc_number', 100)->nullable()->after('bank');
            }
            if (!Schema::hasColumn('payments', 'due_date')) {
                $table->string('due_date', 50)->nullable()->after('doc_number');
            }
            if (!Schema::hasColumn('payments', 'previous_balance')) {
                $table->decimal('previous_balance', 14, 2)->default(0.00)->after('amount');
            }
            if (!Schema::hasColumn('payments', 'new_balance')) {
                $table->decimal('new_balance', 14, 2)->default(0.00)->after('previous_balance');
            }
            if (!Schema::hasColumn('payments', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('new_balance')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('payments', 'notes')) {
                $table->text('notes')->nullable()->after('user_id');
            }
        });

        // 5. Drivers table (3 types: depot_to_client, depot_to_depot, pre_seller)
        if (!Schema::hasTable('drivers')) {
            Schema::create('drivers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('phone');
                $table->string('cin', 20)->nullable();
                $table->string('license_number', 30)->nullable();
                $table->string('driver_type', 30)->default('depot_to_client'); // depot_to_client, depot_to_depot, pre_seller
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->string('assigned_route')->nullable();
                $table->string('vehicle_model')->nullable();
                $table->string('vehicle_plate')->nullable();
                $table->string('capacity')->nullable();
                $table->string('status')->default('disponible'); // disponible, en_tournee, en_transit, en_repos
                $table->string('current_mission')->nullable();
                $table->timestamps();
            });
        }

        // 6. Returns table with SuperAdmin validation and stock return decision
        if (!Schema::hasTable('returns')) {
            Schema::create('returns', function (Blueprint $table) {
                $table->id();
                $table->string('ref')->unique();
                $table->foreignId('customer_id')->constrained('customers');
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->integer('quantity')->default(1);
                $table->decimal('amount', 12, 2)->default(0.00);
                $table->text('reason'); // motif / sbab dyalo
                $table->string('condition')->default('neuf'); // neuf_recommercialisable, defaillant_sav, deteriore
                $table->boolean('restock_approved')->default(false); // wach saleh yrje3 l stock
                $table->string('status')->default('En attente validation'); // En attente validation, Validé, Refusé
                $table->foreignId('validated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('validated_at')->nullable();
                $table->text('superadmin_notes')->nullable();
                $table->timestamps();
            });
        }

        // 7. Quotes / Devis table
        if (!Schema::hasTable('quotes')) {
            Schema::create('quotes', function (Blueprint $table) {
                $table->id();
                $table->string('ref')->unique();
                $table->foreignId('customer_id')->constrained('customers');
                $table->foreignId('commercial_id')->nullable()->constrained('users')->nullOnDelete();
                $table->date('date');
                $table->date('valid_until')->nullable();
                $table->decimal('total_ht', 12, 2)->default(0.00);
                $table->decimal('total_tva', 12, 2)->default(0.00);
                $table->decimal('total_ttc', 12, 2)->default(0.00);
                $table->string('status')->default('Brouillon'); // Brouillon, Envoyé, Accepté, Converti, Refusé
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('quote_items')) {
            Schema::create('quote_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quote_id')->constrained('quotes')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products');
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 10, 2);
                $table->decimal('total', 12, 2);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_items');
        Schema::dropIfExists('quotes');
        Schema::dropIfExists('returns');
        Schema::dropIfExists('drivers');
    }
};
