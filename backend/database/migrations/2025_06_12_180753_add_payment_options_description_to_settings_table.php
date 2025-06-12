<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('settings')->insert([
            'key' => 'payment_options_description',
            'value' => null,
            'type' => 'string',
            'display_name' => 'Payment Options Description',
            'description' => 'Description (HTML) for payment options shown to customers at checkout',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('settings')->insert([
            'key' => 'hero_carousel_interval',
            'value' => '5000',
            'type' => 'integer',
            'display_name' => 'Hero Carousel Interval (ms)',
            'description' => 'Interval in milliseconds for hero carousel image change',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('settings')->insert( [
            'key' => 'what_happens_after_payment',
            'value' => "We'll verify your payment within 24 hours\nOnce verified, your order will be processed and packed\nYou'll receive a shipping confirmation on Instagram\nYour order will be delivered within 3-5 business days",
            'type' => 'text',
            'display_name' => 'What Happens After Payment',
            'description' => 'Description of what happens after payment is made',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->where('key', 'payment_options_description')->delete();
    }
};
