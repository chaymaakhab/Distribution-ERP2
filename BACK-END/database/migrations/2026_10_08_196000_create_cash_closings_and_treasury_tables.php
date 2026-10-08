<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Clôtures de Caisse Dépôt & Chauffeur (Cash Closings / CLT)
        if (!Schema::hasTable('cash_closings')) {
            Schema::create('cash_closings', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // CLT-2026-0045
                $table->foreignId('warehouse_id')->constrained('warehouses');
                $table->foreignId('closed_by_user_id')->constrained('users');
                $table->date('closing_date');
                $table->decimal('cash_theoretical', 14, 2)->default(0.00);
                $table->decimal('cash_counted', 14, 2)->default(0.00);
                $table->decimal('cash_difference', 14, 2)->default(0.00);
                $table->integer('cheques_count')->default(0);
                $table->decimal('cheques_total', 14, 2)->default(0.00);
                $table->integer('effects_count')->default(0);
                $table->decimal('effects_total', 14, 2)->default(0.00);
                $table->decimal('total_collected', 14, 2)->default(0.00);
                $table->string('status', 40)->default('valide_depot'); // brouillon, valide_depot, valide_comptabilite, rejete
                $table->text('justification_notes')->nullable();
                $table->foreignId('validated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('validated_at')->nullable();
                $table->timestamps();
            });
        }

        // 2. Chèques et Effets en Portefeuille (Cheques & Effects in Portfolio)
        if (!Schema::hasTable('cheques_in_hand')) {
            Schema::create('cheques_in_hand', function (Blueprint $table) {
                $table->id();
                $table->string('ref', 50)->unique(); // CHQ-849301 / EFF-006841
                $table->foreignId('customer_id')->constrained('customers');
                $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
                $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
                $table->string('bank', 100);
                $table->decimal('amount', 14, 2);
                $table->date('due_date');
                $table->string('doc_type', 30)->default('cheque'); // cheque, effet
                $table->string('status', 40)->default('en_portefeuille'); // en_portefeuille, remis_en_banque, encaisse, impaye
                $table->string('remittance_ref', 50)->nullable(); // Bordereau de remise
                $table->date('deposit_date')->nullable();
                $table->date('cleared_date')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cheques_in_hand');
        Schema::dropIfExists('cash_closings');
    }
};
