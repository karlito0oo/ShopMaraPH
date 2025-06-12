<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->string('display_name')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
        
        // Insert default settings
        DB::table('settings')->insert([
            [
                'key' => 'delivery_fee',
                'value' => '80',
                'type' => 'integer',
                'display_name' => 'Delivery Fee',
                'description' => 'Standard delivery fee in PHP',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'delivery_fee_ncr',
                'value' => '80',
                'type' => 'integer',
                'display_name' => 'Standard Delivery Fee Within NCR',
                'description' => 'Standard delivery fee for addresses within NCR',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'delivery_fee_outside_ncr',
                'value' => '120',
                'type' => 'integer',
                'display_name' => 'Standard Delivery Fee Outside NCR',
                'description' => 'Standard delivery fee for addresses outside NCR',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'free_delivery_threshold',
                'value' => '0',
                'type' => 'integer',
                'display_name' => 'Free Delivery Threshold',
                'description' => 'Order amount above which delivery is free (0 = no free delivery)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'hero_carousel_interval',
                'value' => '5000',
                'type' => 'integer',
                'display_name' => 'Hero Carousel Interval (ms)',
                'description' => 'Interval in milliseconds for hero carousel image change',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
