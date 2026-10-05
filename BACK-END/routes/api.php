<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\SyncController;
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
        Route::patch('/orders/{ref}/status', [OrderController::class, 'updateStatus'])->middleware('permission:orders.update');

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
