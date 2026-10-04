<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for all missing domain tables (60+ total target tables).
     */
    public function up(): void
    {
        // 1. Order Lines
        if (!Schema::hasTable('order_lines')) {
            Schema::create('order_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->decimal('unit_price_ht', 12, 2);
                $table->decimal('tax_rate', 5, 2)->default(20.00);
                $table->decimal('line_total_ttc', 12, 2);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 2. Order Assignments
        if (!Schema::hasTable('order_assignments')) {
            Schema::create('order_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->foreignId('assigned_user_id')->constrained('users')->cascadeOnDelete();
                $table->string('role_assigned'); // e.g. preparateur, livreur
                $table->string('status')->default('assigned');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 3. Delivery Lines
        if (!Schema::hasTable('delivery_lines')) {
            Schema::create('delivery_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('delivery_id')->constrained('deliveries')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity_delivered');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 4. Delivery Proofs
        if (!Schema::hasTable('delivery_proofs')) {
            Schema::create('delivery_proofs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('delivery_id')->constrained('deliveries')->cascadeOnDelete();
                $table->string('recipient_name');
                $table->string('signature_path')->nullable();
                $table->string('photo_path')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 5. Invoice Lines
        if (!Schema::hasTable('invoice_lines')) {
            Schema::create('invoice_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->decimal('unit_price_ht', 12, 2);
                $table->decimal('tax_rate', 5, 2)->default(20.00);
                $table->decimal('line_total_ttc', 12, 2);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 6. Invoice Taxes
        if (!Schema::hasTable('invoice_taxes')) {
            Schema::create('invoice_taxes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
                $table->decimal('tax_rate', 5, 2);
                $table->decimal('tax_amount', 12, 2);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 7. Payment Allocations
        if (!Schema::hasTable('payment_allocations')) {
            Schema::create('payment_allocations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
                $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
                $table->decimal('allocated_amount', 12, 2);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 8. Cheques
        if (!Schema::hasTable('cheques')) {
            Schema::create('cheques', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
                $table->string('cheque_number');
                $table->string('bank_name');
                $table->decimal('amount', 12, 2);
                $table->date('due_date');
                $table->string('status')->default('en_portefeuille'); // en_portefeuille, depose, encaisse, rejete
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 9. Reminders
        if (!Schema::hasTable('reminders')) {
            Schema::create('reminders', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->string('level'); // relance 1, relance 2, mise en demeure
                $table->text('message');
                $table->string('status')->default('sent');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 10. Returns
        if (!Schema::hasTable('returns')) {
            Schema::create('returns', function (Blueprint $table) {
                $table->id();
                $table->string('return_number')->unique();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->string('reason');
                $table->string('status')->default('pending');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 11. Return Lines
        if (!Schema::hasTable('return_lines')) {
            Schema::create('return_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('return_id')->constrained('returns')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->string('condition')->default('good');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 12. Purchases
        if (!Schema::hasTable('purchases')) {
            Schema::create('purchases', function (Blueprint $table) {
                $table->id();
                $table->string('purchase_number')->unique();
                $table->string('supplier_name');
                $table->decimal('total_amount_ht', 12, 2);
                $table->decimal('total_amount_ttc', 12, 2);
                $table->string('status')->default('draft');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 13. Purchase Lines
        if (!Schema::hasTable('purchase_lines')) {
            Schema::create('purchase_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->decimal('unit_price_ht', 12, 2);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 14. Stock
        if (!Schema::hasTable('stock')) {
            Schema::create('stock', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->string('depot_code')->default('CASABLANCA');
                $table->integer('physical_qty')->default(0);
                $table->integer('reserved_qty')->default(0);
                $table->integer('available_qty')->default(0);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 15. Stock Movements
        if (!Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->string('type'); // in, out, transfer, adjustment
                $table->integer('quantity');
                $table->string('depot_code');
                $table->string('reference');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 16. Stock Reservations
        if (!Schema::hasTable('stock_reservations')) {
            Schema::create('stock_reservations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->integer('reserved_quantity');
                $table->string('status')->default('active');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 17. Stock Transfers
        if (!Schema::hasTable('stock_transfers')) {
            Schema::create('stock_transfers', function (Blueprint $table) {
                $table->id();
                $table->string('transfer_number')->unique();
                $table->string('source_depot');
                $table->string('destination_depot');
                $table->string('status')->default('pending');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 18. Stock Transfer Lines
        if (!Schema::hasTable('stock_transfer_lines')) {
            Schema::create('stock_transfer_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('stock_transfer_id')->constrained('stock_transfers')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 19. Inventories
        if (!Schema::hasTable('inventories')) {
            Schema::create('inventories', function (Blueprint $table) {
                $table->id();
                $table->string('inventory_number')->unique();
                $table->string('depot_code');
                $table->date('inventory_date');
                $table->string('status')->default('draft');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 20. Inventory Lines
        if (!Schema::hasTable('inventory_lines')) {
            Schema::create('inventory_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventory_id')->constrained('inventories')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('expected_qty');
                $table->integer('counted_qty');
                $table->integer('variance');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 21. Reorder Suggestions
        if (!Schema::hasTable('reorder_suggestions')) {
            Schema::create('reorder_suggestions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('current_stock');
                $table->integer('suggested_qty');
                $table->string('status')->default('pending');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 22. Picking Lists
        if (!Schema::hasTable('picking_lists')) {
            Schema::create('picking_lists', function (Blueprint $table) {
                $table->id();
                $table->string('picking_number')->unique();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->string('status')->default('pending');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 23. Picking List Lines
        if (!Schema::hasTable('picking_list_lines')) {
            Schema::create('picking_list_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('picking_list_id')->constrained('picking_lists')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity_to_pick');
                $table->integer('quantity_picked')->default(0);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 24. Routes
        if (!Schema::hasTable('routes')) {
            Schema::create('routes', function (Blueprint $table) {
                $table->id();
                $table->string('route_name');
                $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
                $table->date('route_date');
                $table->string('status')->default('planned');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 25. Route Stops
        if (!Schema::hasTable('route_stops')) {
            Schema::create('route_stops', function (Blueprint $table) {
                $table->id();
                $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->integer('stop_order');
                $table->string('status')->default('pending');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 26. Carts
        if (!Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 27. Cart Items
        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cart_id')->constrained('carts')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->integer('quantity');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 28. Customer Users
        if (!Schema::hasTable('customer_users')) {
            Schema::create('customer_users', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 29. Customer Devices
        if (!Schema::hasTable('customer_devices')) {
            Schema::create('customer_devices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_user_id')->constrained('customer_users')->cascadeOnDelete();
                $table->string('device_token');
                $table->string('platform');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 30. Customer Addresses
        if (!Schema::hasTable('customer_addresses')) {
            Schema::create('customer_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->string('address_type')->default('delivery'); // delivery, billing
                $table->string('address_line');
                $table->string('city');
                $table->string('postal_code')->nullable();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 31. Price Lists
        if (!Schema::hasTable('price_lists')) {
            Schema::create('price_lists', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('currency')->default('MAD');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 32. Price List Items
        if (!Schema::hasTable('price_list_items')) {
            Schema::create('price_list_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('price_list_id')->constrained('price_lists')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->decimal('unit_price', 12, 2);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 33. Product Categories
        if (!Schema::hasTable('product_categories')) {
            Schema::create('product_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 34. Product Brands
        if (!Schema::hasTable('product_brands')) {
            Schema::create('product_brands', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 35. Product Units
        if (!Schema::hasTable('product_units')) {
            Schema::create('product_units', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Carton, Mètre, Piece
                $table->string('symbol');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 36. Product Batches
        if (!Schema::hasTable('product_batches')) {
            Schema::create('product_batches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->string('batch_number');
                $table->date('expiration_date')->nullable();
                $table->integer('quantity');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 37. Companies
        if (!Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('ice');
                $table->string('if');
                $table->string('rc');
                $table->text('address');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 38. Branches
        if (!Schema::hasTable('branches')) {
            Schema::create('branches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('name');
                $table->string('city');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 39. Document Sequences
        if (!Schema::hasTable('document_sequences')) {
            Schema::create('document_sequences', function (Blueprint $table) {
                $table->id();
                $table->string('document_type'); // CMD, FAC, LIV, ACH
                $table->string('prefix');
                $table->integer('next_number')->default(1);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 40. Permissions
        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 41. Role Permissions
        if (!Schema::hasTable('role_permissions')) {
            Schema::create('role_permissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
                $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 42. User Roles
        if (!Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 43. Audit Logs
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('action');
                $table->string('entity_type');
                $table->unsignedBigInteger('entity_id')->nullable();
                $table->text('details')->nullable();
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 44. Sync Operations
        if (!Schema::hasTable('sync_operations')) {
            Schema::create('sync_operations', function (Blueprint $table) {
                $table->id();
                $table->string('sync_type');
                $table->string('status');
                $table->integer('records_synced')->default(0);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 45. Notifications
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->text('body');
                $table->boolean('is_read')->default(false);
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 46. Message Logs
        if (!Schema::hasTable('message_logs')) {
            Schema::create('message_logs', function (Blueprint $table) {
                $table->id();
                $table->string('recipient');
                $table->string('channel'); // sms, whatsapp, email
                $table->text('message');
                $table->string('status');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }

        // 47. Imports
        if (!Schema::hasTable('imports')) {
            Schema::create('imports', function (Blueprint $table) {
                $table->id();
                $table->string('import_type');
                $table->string('file_name');
                $table->integer('total_rows')->default(0);
                $table->string('status');
                $table->timestamps();

                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imports');
        Schema::dropIfExists('message_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('sync_operations');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('document_sequences');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('product_batches');
        Schema::dropIfExists('product_units');
        Schema::dropIfExists('product_brands');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('price_list_items');
        Schema::dropIfExists('price_lists');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('customer_devices');
        Schema::dropIfExists('customer_users');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('route_stops');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('picking_list_lines');
        Schema::dropIfExists('picking_lists');
        Schema::dropIfExists('reorder_suggestions');
        Schema::dropIfExists('inventory_lines');
        Schema::dropIfExists('inventories');
        Schema::dropIfExists('stock_transfer_lines');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('stock_reservations');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('stock');
        Schema::dropIfExists('purchase_lines');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('return_lines');
        Schema::dropIfExists('returns');
        Schema::dropIfExists('reminders');
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('payment_allocations');
        Schema::dropIfExists('invoice_taxes');
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('delivery_proofs');
        Schema::dropIfExists('delivery_lines');
        Schema::dropIfExists('order_assignments');
        Schema::dropIfExists('order_lines');
    }
};
