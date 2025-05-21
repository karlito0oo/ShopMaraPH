<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\AnnouncementController;
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

// Public announcements route - read only
Route::get('announcements', [AnnouncementController::class, 'index']);

// Guest checkout routes
Route::post('guest-orders', [OrderController::class, 'createGuestOrder']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Profile routes
    Route::get('profile', [UserProfileController::class, 'getProfile']);
    Route::post('profile', [UserProfileController::class, 'updateProfile']);
    
    // Cart routes
    Route::get('cart', [CartController::class, 'getCart']);
    Route::post('cart/add', [CartController::class, 'addToCart']);
    Route::post('cart/update', [CartController::class, 'updateCartItem']);
    Route::post('cart/remove', [CartController::class, 'removeFromCart']);
    Route::post('cart/clear', [CartController::class, 'clearCart']);
    
    // Order routes
    Route::post('orders', [OrderController::class, 'createOrder']);
    Route::get('orders', [OrderController::class, 'getUserOrders']);
    Route::get('orders/{id}', [OrderController::class, 'getUserOrder']);
    
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
        
        // Order management
        Route::get('admin/orders', [OrderController::class, 'getAllOrders']);
        Route::get('admin/orders/{id}', [OrderController::class, 'getOrder']);
        Route::post('admin/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
        
        // Announcement management
        Route::get('admin/announcements', [AnnouncementController::class, 'adminIndex']);
        Route::get('admin/announcements/{id}', [AnnouncementController::class, 'show']);
        Route::post('admin/announcements', [AnnouncementController::class, 'store']);
        Route::put('admin/announcements/{id}', [AnnouncementController::class, 'update']);
        Route::delete('admin/announcements/{id}', [AnnouncementController::class, 'destroy']);
        Route::post('admin/announcements/{id}/toggle', [AnnouncementController::class, 'toggleStatus']);
    });
}); 