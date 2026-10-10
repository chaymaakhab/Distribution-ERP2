<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend users with commercial code & commission rate
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'commercial_code')) {
                $table->string('commercial_code', 30)->nullable()->unique()->after('email');
            }
            if (!Schema::hasColumn('users', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->default(5.00)->after('commercial_code');
            }
        });

        // 2. Extend customers with commercial reference, commission percentage & creator
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'commercial_reference')) {
                $table->string('commercial_reference', 50)->nullable()->after('commercial_id');
            }
            if (!Schema::hasColumn('customers', 'commission_percentage')) {
                $table->decimal('commission_percentage', 5, 2)->default(5.00)->after('commercial_reference');
            }
            if (!Schema::hasColumn('customers', 'created_by_user_id')) {
                $table->foreignId('created_by_user_id')->nullable()->after('commission_percentage')
                    ->constrained('users')->nullOnDelete();
            }
        });

        // 3. Assign commercial codes and default commission rate for commercial users
        $commercialUsers = DB::table('users')
            ->join('role_user', 'users.id', '=', 'role_user.user_id')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('roles.code', 'commercial')
            ->select('users.id', 'users.name')
            ->get();

        $index = 1;
        foreach ($commercialUsers as $user) {
            $code = 'COM-' . str_pad($index++, 3, '0', STR_PAD_LEFT);
            DB::table('users')->where('id', $user->id)->update([
                'commercial_code' => $code,
                'commission_rate' => 5.00,
            ]);
        }

        // 4. Update warehouse (Responsable dépôt) role permissions in DB to include customer management
        $warehouseRole = DB::table('roles')->where('code', 'warehouse')->first();
        if ($warehouseRole) {
            $perms = json_decode($warehouseRole->permissions, true) ?: [];
            $newPerms = array_unique(array_merge($perms, [
                'customers.view',
                'customers.create',
                'customers.update',
                'customer_accounts.manage',
            ]));
            DB::table('roles')->where('code', 'warehouse')->update([
                'permissions' => json_encode(array_values($newPerms)),
            ]);
        }

        // 5. Backfill commercial reference & commission percentage on existing customers
        $customers = DB::table('customers')->whereNotNull('commercial_id')->get();
        foreach ($customers as $c) {
            $comm = DB::table('users')->where('id', $c->commercial_id)->first();
            if ($comm) {
                DB::table('customers')->where('id', $c->id)->update([
                    'commercial_reference' => $comm->commercial_code ?? 'COM-001',
                    'commission_percentage' => $comm->commission_rate ?? 5.00,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'created_by_user_id')) {
                $table->dropConstrainedForeignId('created_by_user_id');
            }
            if (Schema::hasColumn('customers', 'commercial_reference')) {
                $table->dropColumn(['commercial_reference', 'commission_percentage']);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'commercial_code')) {
                $table->dropColumn(['commercial_code', 'commission_rate']);
            }
        });
    }
};
