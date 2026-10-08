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

        // SuperAdmin / Administrateur : global dashboard, charts, map, rankings.
        Route::prefix('admin')->group(function () {
            Route::get('/overview', [AdminDashboardController::class, 'overview'])->middleware('permission:dashboard.view');
            Route::get('/revenue', [AdminDashboardController::class, 'revenue'])->middleware('permission:reports.view');
            Route::get('/warehouses', [AdminDashboardController::class, 'warehouses'])->middleware('permission:warehouses.view');
            Route::get('/performance', [AdminDashboardController::class, 'performance'])->middleware('permission:reports.view');
        });

        Route::get('/orders', [OrderController::class, 'index'])->middleware('permission:orders.view');
        Route::post('/orders', [OrderController::class, 'store'])->middleware('permission:orders.create');
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
        Route::patch('/orders/{ref}/status', [OrderController::class, 'updateStatus'])->middleware('permission:orders.update');

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

        // Stocks & Inventories
        Route::get('/stocks', [StockController::class, 'index']);
        Route::post('/stocks', [StockController::class, 'store']);
        Route::put('/stocks/{id}', [StockController::class, 'update']);
        Route::post('/stocks/transfer', [StockController::class, 'transfer']);

        // Staff Users Management
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Returns & SAV (with SuperAdmin approval)
        Route::get('/returns', [ReturnController::class, 'index']);
        Route::post('/returns', [ReturnController::class, 'store']);
        Route::patch('/returns/{id}/validate', [ReturnController::class, 'validateReturn']);

        Route::post('/sync', [SyncController::class, 'sync']);
    });

    // ---------------------------------------------------------------------
    // Customer shopping portal.
    // ---------------------------------------------------------------------
    Route::prefix('customer')->group(function () {
        // Guest: login is throttled to limit repeated attempts.
        Route::middleware('throttle:5,1')->group(function () {
            Route::post('/login', [CustomerAuthController::class, 'login']);
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
        });
    });
});
