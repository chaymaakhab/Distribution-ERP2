<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Parc de Véhicules (Fleet Management)
        if (!Schema::hasTable('vehicles')) {
            Schema::create('vehicles', function (Blueprint $table) {
                $table->id();
                $table->string('plate_number', 40)->unique(); // e.g. 23-A-54321
                $table->string('model', 100); // e.g. Renault Master 3.5T
                $table->string('vehicle_type', 50)->default('Fourgonnette'); // Fourgonnette, Camion 3.5T, Camion 8T, Camion 12T
                $table->string('capacity', 100)->default('3.5 T / 4 Palettes');
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
                $table->integer('mileage')->default(0);
                $table->date('technical_visit_expiry')->nullable();
                $table->date('insurance_expiry')->nullable();
                $table->string('status', 40)->default('disponible'); // disponible, en_mission, en_maintenance, hors_service
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
