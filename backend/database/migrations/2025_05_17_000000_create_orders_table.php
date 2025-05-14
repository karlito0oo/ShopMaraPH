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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending'); // pending, approved, shipped, delivered, cancelled
            $table->string('customer_name');
            $table->string('instagram_username');
            $table->string('address_line1');
            $table->string('barangay');
            $table->string('city');
            $table->string('mobile_number');
            $table->string('payment_method')->default('bank_transfer');
            $table->string('payment_proof')->nullable(); // path to uploaded payment proof image
            $table->decimal('total_amount', 10, 2);
            $table->text('admin_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
}; 