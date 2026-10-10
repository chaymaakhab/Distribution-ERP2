<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\SyncController;
use App\Http\Controllers\Api\v1\CustomerController;
use App\Http\Controllers\Api\v1\PaymentController;
use App\Http\Controllers\Api\v1\ProductController;
use App\Http\Controllers\Api\v1\DriverController;
use App\Http\Controllers\Api\v1\StockController;
use App\Http\Controllers\Api\v1\ReturnController;
use App\Http\Controllers\Api\v1\SupplierController;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\PurchaseOrderController;
use App\Http\Controllers\Api\v1\StockTransferController;
use App\Http\Controllers\Api\v1\PreparationController;
use App\Http\Controllers\Api\v1\DeliveryTourController;
use App\Http\Controllers\Api\v1\TreasuryController;
use App\Http\Controllers\Api\v1\InvoiceController;
use App\Http\Controllers\Api\v1\VehicleController;
use App\Http\Controllers\Api\v1\StockMovementController;
use App\Http\Controllers\Api\v1\QuoteController;
use App\Http\Controllers\Api\v1\DeliverySlipController;
use App\Http\Controllers\Api\v1\PurchaseReceiptController;
use App\Http\Controllers\Api\v1\InventoryAuditController;
use App\Http\Controllers\Api\v1\AuditLogController;
use App\Http\Controllers\Api\v1\CompanySettingController;
use App\Http\Controllers\Api\v1\WarehouseController;
use App\Http\Controllers\Api\v1\CommercialVisitController;
use App\Http\Controllers\Api\v1\NotificationController;
use App\Http\Controllers\Api\v1\PromotionController;
use App\Http\Controllers\Api\v1\RoleManagementController;
use App\Http\Controllers\Api\v1\SaasCompanyController;
use App\Http\Controllers\Api\v1\ValidationRequestController;
use App\Http\Controllers\Api\v1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\v1\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Api\v1\Customer\CatalogController as CustomerCatalogController;
use App\Http\Controllers\Api\v1\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\v1\Customer\InvoiceController as CustomerInvoiceController;
use App\Http\Controllers\Api\v1\Customer\AccountController as CustomerAccountController;


Route::prefix('v1')->group(function () {
    // ---------------------------------------------------------------------
    // Staff (internal ERP).
    // ---------------------------------------------------------------------
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:staff')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);

        Route::get('/roles', [AuthController::class, 'roles'])->middleware('permission:roles.view');
        Route::get('/roles/management', [RoleManagementController::class, 'index']);
        Route::put('/roles/{id}/permissions', [RoleManagementController::class, 'updatePermissions']);

        // SuperAdmin / Administrateur : global dashboard, charts, map, rankings, commercials & clients.
        Route::prefix('admin')->group(function () {
            Route::get('/overview', [AdminDashboardController::class, 'overview'])->middleware('permission:dashboard.view');
            Route::get('/revenue', [AdminDashboardController::class, 'revenue'])->middleware('permission:reports.view');
            Route::get('/warehouses', [AdminDashboardController::class, 'warehouses'])->middleware('permission:warehouses.view');
            Route::get('/performance', [AdminDashboardController::class, 'performance'])->middleware('permission:reports.view');
            Route::get('/commercials-clients', [AdminDashboardController::class, 'commercialsClients']);
            Route::put('/commercials/{id}/commission-rate', [AdminDashboardController::class, 'updateCommercialCommission']);
            Route::get('/commercial-commissions', [AdminDashboardController::class, 'commercialCommissions']);
            Route::patch('/commercial-commissions/{id}/status', [AdminDashboardController::class, 'updateCommercialCommissionStatus']);
            Route::post('/commercial-commissions/settle', [AdminDashboardController::class, 'settleCommercialCommissions']);
        });

        // Orders Management
        Route::get('/orders', [OrderController::class, 'index'])->middleware('permission:orders.view');
        Route::get('/orders/{id}', [OrderController::class, 'show'])->middleware('permission:orders.view');
        Route::post('/orders', [OrderController::class, 'store'])->middleware('permission:orders.create');
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
        Route::patch('/orders/{ref}/status', [OrderController::class, 'updateStatus'])->middleware('permission:orders.update');
        Route::post('/orders/{id}/generate-delivery-slip', [OrderController::class, 'generateDeliverySlip']);
        Route::post('/orders/{id}/generate-invoice', [OrderController::class, 'generateInvoice']);

        // Quotes / Devis & Proformas
        Route::get('/quotes', [QuoteController::class, 'index']);
        Route::get('/quotes/{id}', [QuoteController::class, 'show']);
        Route::post('/quotes', [QuoteController::class, 'store']);
        Route::put('/quotes/{id}', [QuoteController::class, 'update']);
        Route::patch('/quotes/{id}/status', [QuoteController::class, 'updateStatus']);
        Route::post('/quotes/{id}/convert-to-order', [QuoteController::class, 'convertToOrder']);

        // Customers CRM
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::put('/customers/{id}', [CustomerController::class, 'update']);
        Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

        // Payments & Client settlements
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);

        // Products & Catalog
        Route::get('/products', [ProductController::class, 'index']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Suppliers
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

        // Drivers & Fleet Logistics
        Route::get('/drivers', [DriverController::class, 'index']);
        Route::post('/drivers', [DriverController::class, 'store']);
        Route::patch('/drivers/{id}/status', [DriverController::class, 'updateStatus']);
        Route::patch('/drivers/{id}/location', [DriverController::class, 'updateLocation']);

        // Stocks & Inventories
        Route::get('/stocks', [StockController::class, 'index']);
        Route::post('/stocks', [StockController::class, 'store']);
        Route::put('/stocks/{id}', [StockController::class, 'update']);
        Route::post('/stocks/transfer', [StockController::class, 'transfer']);

        // Warehouses / Dépôts
        Route::get('/warehouses', [WarehouseController::class, 'index']);
        Route::get('/warehouses/{id}', [WarehouseController::class, 'show']);
        Route::post('/warehouses', [WarehouseController::class, 'store']);
        Route::put('/warehouses/{id}', [WarehouseController::class, 'update']);
        Route::delete('/warehouses/{id}', [WarehouseController::class, 'destroy']);

        // Staff Users Management
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Returns & SAV (with SuperAdmin approval)
        Route::get('/returns', [ReturnController::class, 'index']);
        Route::post('/returns', [ReturnController::class, 'store']);
        Route::patch('/returns/{id}/validate', [ReturnController::class, 'validateReturn']);

        // Purchase Orders / Bons d'Achat
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::patch('/purchase-orders/{id}/status', [PurchaseOrderController::class, 'updateStatus']);

        // Purchase Receipts / Bons de Réception Fournisseur
        Route::get('/purchase-receipts', [PurchaseReceiptController::class, 'index']);
        Route::get('/purchase-receipts/{id}', [PurchaseReceiptController::class, 'show']);
        Route::post('/purchase-receipts', [PurchaseReceiptController::class, 'store']);

        // Inter-depot Transfers / Transferts Inter-Dépôts
        Route::get('/transfers', [StockTransferController::class, 'index']);
        Route::post('/transfers', [StockTransferController::class, 'store']);
        Route::patch('/transfers/{id}/status', [StockTransferController::class, 'updateStatus']);

        // Order Preparation & Barcode Scanning
        Route::get('/picking-lists', [PreparationController::class, 'index']);
        Route::get('/picking-lists/{id}', [PreparationController::class, 'show']);
        Route::post('/picking-lists/{id}/scan', [PreparationController::class, 'scanItem']);

        // Delivery Tours & Tour Stops
        Route::get('/delivery-tours', [DeliveryTourController::class, 'index']);
        Route::get('/delivery-tours/{id}', [DeliveryTourController::class, 'show']);
        Route::patch('/delivery-tours/{tourId}/stops/{stopId}', [DeliveryTourController::class, 'updateStop']);

        // Delivery Slips / Bons de Livraison (BL)
        Route::get('/delivery-slips', [DeliverySlipController::class, 'index']);
        Route::get('/delivery-slips/{id}', [DeliverySlipController::class, 'show']);
        Route::post('/delivery-slips', [DeliverySlipController::class, 'store']);
        Route::patch('/delivery-slips/{id}/status', [DeliverySlipController::class, 'updateStatus']);
        Route::post('/delivery-slips/{id}/sign', [DeliverySlipController::class, 'sign']);

        // Invoicing & Credit Notes
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
        Route::get('/credit-notes', [InvoiceController::class, 'creditNotes']);
        Route::post('/credit-notes', [InvoiceController::class, 'storeCreditNote']);

        // Treasury, Cash Closings & Cheques
        Route::get('/treasury/closings', [TreasuryController::class, 'closings']);
        Route::post('/treasury/closings', [TreasuryController::class, 'storeClosing']);
        Route::get('/treasury/cheques', [TreasuryController::class, 'cheques']);
        Route::patch('/treasury/cheques/{id}/status', [TreasuryController::class, 'updateChequeStatus']);

        // Inventory Audits / Inventaires Physiques
        Route::get('/inventory-audits', [InventoryAuditController::class, 'index']);
        Route::get('/inventory-audits/{id}', [InventoryAuditController::class, 'show']);
        Route::post('/inventory-audits', [InventoryAuditController::class, 'store']);
        Route::post('/inventory-audits/{id}/adjust-stock', [InventoryAuditController::class, 'adjustStock']);

        // Commercial Field Visits / Visites Commerciales Terrain
        Route::get('/visits', [CommercialVisitController::class, 'index']);
        Route::get('/visits/{id}', [CommercialVisitController::class, 'show']);
        Route::post('/visits', [CommercialVisitController::class, 'store']);
        Route::patch('/visits/{id}/checkin', [CommercialVisitController::class, 'checkin']);
        Route::patch('/visits/{id}/complete', [CommercialVisitController::class, 'complete']);

        // Notifications & Alerts
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

        // Promotions & Price Rules
        Route::get('/promotions', [PromotionController::class, 'index']);
        Route::get('/promotions/{id}', [PromotionController::class, 'show']);
        Route::post('/promotions', [PromotionController::class, 'store']);
        Route::put('/promotions/{id}', [PromotionController::class, 'update']);
        Route::delete('/promotions/{id}', [PromotionController::class, 'destroy']);

        // Company Settings & Legal Mentions
        Route::get('/settings/company', [CompanySettingController::class, 'show']);
        Route::put('/settings/company', [CompanySettingController::class, 'update']);

        // Audit Trail Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::post('/audit-logs', [AuditLogController::class, 'store']);

        // Fleet Vehicles & Stock Movements
        Route::get('/vehicles', [VehicleController::class, 'index']);
        Route::post('/vehicles', [VehicleController::class, 'store']);
        Route::get('/stock-movements', [StockMovementController::class, 'index']);

        // Offline Data Synchronization
        Route::post('/sync', [SyncController::class, 'sync']);

        // SaaS Multi-Company & Subscription Management (Super Admin SaaS Master)
        Route::get('/saas/overview', [SaasCompanyController::class, 'overview']);
        Route::get('/saas/companies', [SaasCompanyController::class, 'index']);
        Route::post('/saas/companies', [SaasCompanyController::class, 'store']);
        Route::get('/saas/companies/{id}', [SaasCompanyController::class, 'show']);
        Route::put('/saas/companies/{id}', [SaasCompanyController::class, 'update']);
        Route::patch('/saas/companies/{id}/subscription', [SaasCompanyController::class, 'updateSubscription']);
        Route::patch('/saas/companies/{id}/toggle-suspension', [SaasCompanyController::class, 'toggleSuspension']);
        Route::get('/saas/my-company', [SaasCompanyController::class, 'myCompany']);

        // Hierarchical Validation Tasks & Arbitrations (Super Admin & Enterprise Admin)
        Route::get('/validation-requests', [ValidationRequestController::class, 'index']);
        Route::post('/validation-requests', [ValidationRequestController::class, 'store']);
        Route::patch('/validation-requests/{id}/arbitrate', [ValidationRequestController::class, 'arbitrate']);
    });


    // ---------------------------------------------------------------------
    // Customer shopping portal.
    // ---------------------------------------------------------------------
    Route::prefix('customer')->group(function () {
        // Public list of active commercials for selection
        Route::get('/commercials', [CustomerAuthController::class, 'commercials']);

        // Guest: login & register are throttled to limit repeated attempts.
        Route::middleware('throttle:10,1')->group(function () {
            Route::post('/login', [CustomerAuthController::class, 'login']);
            Route::post('/register', [CustomerAuthController::class, 'register']);
        });

        // Authenticated customer. Every endpoint is scoped to the token owner.
        Route::middleware('auth:customer')->group(function () {
            Route::post('/logout', [CustomerAuthController::class, 'logout']);
            Route::get('/me', [CustomerAuthController::class, 'me']);

            Route::get('/catalog/categories', [CustomerCatalogController::class, 'categories']);
            Route::get('/catalog/products', [CustomerCatalogController::class, 'products']);
            Route::get('/catalog/products/{code}', [CustomerCatalogController::class, 'product']);

            Route::get('/orders', [CustomerOrderController::class, 'index']);
            Route::post('/orders', [CustomerOrderController::class, 'store']);
            Route::get('/orders/{ref}', [CustomerOrderController::class, 'show']);
            Route::post('/orders/{ref}/reorder', [CustomerOrderController::class, 'reorder']);

            Route::get('/invoices', [CustomerInvoiceController::class, 'index']);
            Route::get('/invoices/{ref}', [CustomerInvoiceController::class, 'show']);

            Route::get('/account/balance', [CustomerAccountController::class, 'balance']);
            Route::put('/account/profile', [CustomerAccountController::class, 'updateProfile']);
            Route::put('/account/commercial', [CustomerAccountController::class, 'chooseCommercial']);
        });
    });
});
