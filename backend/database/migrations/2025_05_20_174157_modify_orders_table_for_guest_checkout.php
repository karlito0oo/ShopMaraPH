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
        Schema::table('orders', function (Blueprint $table) {
            // Make user_id nullable for guest orders
            $table->unsignedBigInteger('user_id')->nullable()->change();
            
            // Add email for guest orders
            $table->string('email')->nullable()->after('customer_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Revert user_id to be required
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            
            // Remove the email column
            $table->dropColumn('email');
        });
    }
};
