<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('commercial_commissions')) {
            Schema::create('commercial_commissions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('company_id')->nullable();
                $table->foreignId('commercial_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
                $table->string('commercial_reference', 50)->nullable();
                $table->decimal('base_amount', 12, 2)->default(0);
                $table->decimal('commission_rate', 5, 2)->default(5.00);
                $table->decimal('commission_amount', 12, 2)->default(0);
                $table->enum('status', ['pending', 'validated', 'paid', 'cancelled'])->default('pending');
                $table->timestamp('paid_at')->nullable();
                $table->string('period', 20)->nullable(); // e.g. '2026-10'
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['commercial_id', 'status']);
                $table->index(['customer_id']);
                $table->index(['period']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('commercial_commissions');
    }
};
