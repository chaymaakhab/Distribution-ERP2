<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('supplier_users')) {
            Schema::create('supplier_users', function (Blueprint $table) {
                $table->id();
                $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
                $table->string('name');
                $table->string('phone')->unique();
                $table->string('email')->nullable();
                $table->string('password');
                $table->string('pin_hash')->nullable();
                $table->boolean('is_blocked')->default(false);
                $table->timestamp('last_login_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('supplier_devices')) {
            Schema::create('supplier_devices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('supplier_user_id')->constrained('supplier_users')->onDelete('cascade');
                $table->string('device_id');
                $table->string('platform')->default('web');
                $table->timestamp('last_seen_at')->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('user_roles')) {
            Schema::table('user_roles', function (Blueprint $table) {
                if (!Schema::hasColumn('user_roles', 'warehouse_id')) {
                    $table->foreignId('warehouse_id')->nullable()->after('role_id')->constrained('warehouses')->onDelete('set null');
                }
            });
        }

        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('module');
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('role_permissions')) {
            Schema::create('role_permissions', function (Blueprint $table) {
                $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
                $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
                $table->primary(['role_id', 'permission_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        if (Schema::hasTable('user_roles') && Schema::hasColumn('user_roles', 'warehouse_id')) {
            Schema::table('user_roles', function (Blueprint $table) {
                $table->dropForeign(['warehouse_id']);
                $table->dropColumn('warehouse_id');
            });
        }
        Schema::dropIfExists('supplier_devices');
        Schema::dropIfExists('supplier_users');
    }
};
