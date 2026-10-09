<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table) {
                $table->id();
                $table->string('code', 30)->unique();
                $table->string('name');
                $table->string('brand_name')->nullable();
                $table->string('ice', 20)->nullable();
                $table->string('rc', 50)->nullable();
                $table->string('if_tax', 50)->nullable();
                $table->string('patente', 50)->nullable();
                $table->string('cnss', 50)->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('city')->default('Casablanca');
                $table->text('address')->nullable();
                $table->string('logo_url')->nullable();
                $table->foreignId('admin_user_id')->nullable()->constrained('users')->nullOnDelete();

                // SaaS Subscription Attributes
                $table->string('subscription_plan')->default('pro'); // starter, pro, enterprise, custom
                $table->string('subscription_status')->default('active'); // active, trial, expired, suspended
                $table->date('subscription_start_date')->nullable();
                $table->date('subscription_end_date')->nullable();
                $table->decimal('subscription_price', 12, 2)->default(0.00); // DH
                $table->string('subscription_billing_cycle')->default('annuel'); // mensuel, annuel
                $table->integer('max_users')->default(15);
                $table->integer('max_warehouses')->default(5);
                $table->string('status')->default('active'); // active, suspended
                $table->timestamps();
            });
        }

        // Add company_id to core tables if not already present
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('warehouse_id')->constrained('companies')->nullOnDelete();
            }
        });

        Schema::table('warehouses', function (Blueprint $table) {
            if (!Schema::hasColumn('warehouses', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('address')->constrained('companies')->nullOnDelete();
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            }
        });

        // Seed Default SaaS Companies
        if (DB::table('companies')->count() === 0) {
            $now = now();
            $comp1 = DB::table('companies')->insertGetId([
                'code' => 'SOC-001',
                'name' => 'Hercules Distribution Maroc S.A.R.L.',
                'brand_name' => 'Hercules Distribution',
                'ice' => '002345678000045',
                'rc' => '458920 Casablanca',
                'if_tax' => '33214589',
                'patente' => '24589120',
                'cnss' => '7845120',
                'email' => 'contact@hercules-erp.ma',
                'phone' => '+212 522 45 67 89',
                'city' => 'Casablanca',
                'address' => 'Zone Industrielle Aïn Sebaâ, Casablanca',
                'admin_user_id' => DB::table('users')->where('id', 2)->exists() ? 2 : DB::table('users')->value('id'),
                'subscription_plan' => 'enterprise',
                'subscription_status' => 'active',
                'subscription_start_date' => $now->copy()->subMonths(2)->toDateString(),
                'subscription_end_date' => $now->copy()->addMonths(10)->toDateString(),
                'subscription_price' => 95000.00,
                'subscription_billing_cycle' => 'annuel',
                'max_users' => 50,
                'max_warehouses' => 10,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $comp2 = DB::table('companies')->insertGetId([
                'code' => 'SOC-002',
                'name' => 'Atlas Négoce & Logistique S.A.R.L.',
                'brand_name' => 'Atlas Logix Fès',
                'ice' => '001987654000012',
                'rc' => '128490 Fès',
                'if_tax' => '44125890',
                'patente' => '32104589',
                'cnss' => '6547891',
                'email' => 'direction@atlas-negoce.ma',
                'phone' => '+212 535 62 14 78',
                'city' => 'Fès',
                'address' => 'Boulevard Hassan II, Quartier Industriel Dokkarat',
                'subscription_plan' => 'pro',
                'subscription_status' => 'active',
                'subscription_start_date' => $now->copy()->subMonths(3)->toDateString(),
                'subscription_end_date' => $now->copy()->addMonths(9)->toDateString(),
                'subscription_price' => 45000.00,
                'subscription_billing_cycle' => 'annuel',
                'max_users' => 20,
                'max_warehouses' => 4,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $comp3 = DB::table('companies')->insertGetId([
                'code' => 'SOC-003',
                'name' => 'Souss Agro-Distribution & Trade',
                'brand_name' => 'Souss Agro Agadir',
                'ice' => '003214589000078',
                'rc' => '89420 Agadir',
                'if_tax' => '55214789',
                'patente' => '14258963',
                'cnss' => '9874561',
                'email' => 'contact@souss-trade.ma',
                'phone' => '+212 528 84 51 20',
                'city' => 'Agadir',
                'address' => 'Zone Logistique Anza, Agadir',
                'subscription_plan' => 'starter',
                'subscription_status' => 'active',
                'subscription_start_date' => $now->copy()->subMonths(5)->toDateString(),
                'subscription_end_date' => $now->copy()->addMonths(7)->toDateString(),
                'subscription_price' => 18000.00,
                'subscription_billing_cycle' => 'annuel',
                'max_users' => 5,
                'max_warehouses' => 2,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $comp4 = DB::table('companies')->insertGetId([
                'code' => 'SOC-004',
                'name' => 'Tanger Med Trade & Supply',
                'brand_name' => 'Tanger Med Supply',
                'ice' => '004561230000099',
                'rc' => '994512 Tanger',
                'if_tax' => '66321478',
                'patente' => '45879612',
                'cnss' => '3214569',
                'email' => 'ops@tangermedsupply.ma',
                'phone' => '+212 539 33 22 11',
                'city' => 'Tanger',
                'address' => 'Zone Franche Logistique, Tanger Med',
                'subscription_plan' => 'enterprise',
                'subscription_status' => 'trial',
                'subscription_start_date' => $now->copy()->subDays(10)->toDateString(),
                'subscription_end_date' => $now->copy()->addDays(20)->toDateString(),
                'subscription_price' => 85000.00,
                'subscription_billing_cycle' => 'annuel',
                'max_users' => 30,
                'max_warehouses' => 6,
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Assign existing staff users (except Super Admin) to Hercules Distribution (comp1)
            DB::table('users')->where('id', '>', 1)->update(['company_id' => $comp1]);
            // Assign existing warehouses to Hercules Distribution (comp1)
            DB::table('warehouses')->update(['company_id' => $comp1]);
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'company_id')) {
                $table->dropConstrainedForeignId('company_id');
            }
        });
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'company_id')) {
                $table->dropConstrainedForeignId('company_id');
            }
        });
        Schema::table('warehouses', function (Blueprint $table) {
            if (Schema::hasColumn('warehouses', 'company_id')) {
                $table->dropConstrainedForeignId('company_id');
            }
        });
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'company_id')) {
                $table->dropConstrainedForeignId('company_id');
            }
        });
        Schema::dropIfExists('companies');
    }
};
