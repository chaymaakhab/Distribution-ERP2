<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('validation_requests')) {
            Schema::create('validation_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
                $table->string('ref', 40)->unique();
                $table->string('op_type', 40); // retour, derogation_credit, remise_exceptionnelle, annulation_commande, ajustement_stock
                $table->string('priority', 20)->default('normale'); // urgente, haute, normale, basse
                $table->string('order_ref', 40)->nullable();
                $table->string('client_name')->nullable();
                $table->string('depot_name')->nullable();
                $table->string('requester_name')->nullable();
                $table->string('requester_role')->nullable();
                $table->string('product_name')->nullable();
                $table->decimal('qty', 10, 2)->default(0);
                $table->decimal('amount', 12, 2)->default(0.00);
                $table->text('motif')->nullable();
                $table->text('notes')->nullable();
                $table->string('status', 30)->default('en_attente'); // en_attente, valide, rejete, arbitre
                $table->string('arbitrated_by')->nullable();
                $table->timestamp('arbitrated_at')->nullable();
                $table->text('decision_motif')->nullable();
                $table->string('decision_action', 60)->nullable(); // reintegre_stock, rebut_perte, accord_credit, refus_credit, etc.
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('validation_requests');
    }
};
