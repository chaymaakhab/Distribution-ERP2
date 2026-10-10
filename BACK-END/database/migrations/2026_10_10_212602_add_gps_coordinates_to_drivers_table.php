<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->decimal('lat', 10, 7)->nullable()->after('capacity');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
            $table->integer('speed_kmh')->default(0)->after('lng');
            $table->timestamp('last_location_at')->nullable()->after('speed_kmh');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng', 'speed_kmh', 'last_location_at']);
        });
    }
};
