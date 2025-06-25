<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Remove columns from cart_items
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn(['quantity']);
        });

        // Remove columns from order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['size', 'quantity']);
        });

        // Drop stocks table
        Schema::dropIfExists('stocks');

        // Drop product_sizes table
        Schema::dropIfExists('product_sizes');

        // Add status column to products
        Schema::table('products', function (Blueprint $table) {
            $table->enum('status', ['Available', 'Sold'])->default('Available');
        });
    }

    public function down()
    {
        // Add columns back to cart_items
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('size')->nullable();
            $table->integer('quantity')->default(1);
        });

        // Add columns back to order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('size')->nullable();
            $table->integer('quantity')->default(1);
        });

        // Recreate stocks table
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->timestamps();
        });

        // Recreate product_sizes table
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('size');
            $table->timestamps();
        });

        // Remove status column from products
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}; 