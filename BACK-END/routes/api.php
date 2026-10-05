<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\SyncController;

use App\Http\Controllers\Api\Supplier\SupplierAuthController;
use App\Http\Controllers\Api\Supplier\SupplierDashboardController;
use App\Http\Controllers\Api\Supplier\SupplierProductController;
use App\Http\Controllers\Api\Supplier\SupplierOrderController;
use App\Http\Controllers\Api\Supplier\SupplierQuoteController;
use App\Http\Controllers\Api\Supplier\SupplierInvoiceController;
use App\Http\Controllers\Api\Supplier\SupplierPaymentController;
use App\Http\Controllers\Api\Supplier\SupplierBalanceController;

Route::prefix('v1')->group(function () {
    // Auth & Roles
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/roles', [AuthController::class, 'roles']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders/{ref}/status', [OrderController::class, 'updateStatus']);

    // Offline Sync
    Route::post('/sync', [SyncController::class, 'sync']);

    // Supplier Portal Routes
    Route::prefix('supplier')->group(function () {
        Route::post('/auth/login', [SupplierAuthController::class, 'login']);
        Route::get('/auth/me', [SupplierAuthController::class, 'me']);
        Route::get('/dashboard', [SupplierDashboardController::class, 'index']);
        Route::get('/products', [SupplierProductController::class, 'index']);
        Route::get('/orders', [SupplierOrderController::class, 'index']);
        Route::get('/orders/{id}', [SupplierOrderController::class, 'show']);
        Route::get('/quotes', [SupplierQuoteController::class, 'index']);
        Route::post('/quotes', [SupplierQuoteController::class, 'store']);
        Route::get('/invoices', [SupplierInvoiceController::class, 'index']);
        Route::get('/payments', [SupplierPaymentController::class, 'index']);
        Route::get('/balance', [SupplierBalanceController::class, 'show']);
    });
});
