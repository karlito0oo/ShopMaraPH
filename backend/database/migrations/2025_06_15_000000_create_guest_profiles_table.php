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
        Schema::create('guest_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('guest_id')->unique();
            $table->string('customer_name');
            $table->string('instagram_username')->nullable();
            $table->string('address_line1');
            $table->string('barangay');
            $table->string('province');
            $table->string('city');
            $table->string('mobile_number');
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_profiles');
    }
}; 