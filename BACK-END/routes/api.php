<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\SyncController;

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
});
