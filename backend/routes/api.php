<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Middleware\AdminMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Public product routes - read only
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{id}', [ProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Admin routes for product management
    Route::middleware([AdminMiddleware::class])->group(function () {
        // Create a new product
        Route::post('products', [ProductController::class, 'store']);
        
        // Update existing product - primary method using POST with _method=PUT spoofing
        Route::post('products/{id}', [ProductController::class, 'store']); 
        
        // Keep direct PUT as a fallback for API clients that support it
        Route::put('products/{id}', [ProductController::class, 'store']);
        
        // Delete a product
        Route::delete('products/{id}', [ProductController::class, 'destroy']);
        
        // Restock a product
        Route::post('products/{id}/restock', [ProductController::class, 'restock']);
    });
}); 