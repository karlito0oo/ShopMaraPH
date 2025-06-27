<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->nullable()->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('care_instructions')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('image')->nullable(); // Main product image (file path)
            $table->json('images')->nullable(); // Additional product images (file paths)
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_sale')->default(false);
            $table->enum('status', ['Available', 'Sold'])->default('Available');
            $table->string('size')->default('m'); // Default to medium size
            $table->string('onhold_by_type')->nullable(); // 'guest' or 'user'
            $table->string('onhold_by_id')->nullable(); // guest_id or user_id
            $table->timestamp('onhold_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
