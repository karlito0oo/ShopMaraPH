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
        // Only insert if not exists
        if (!DB::table('settings')->where('key', 'thanks_message')->exists()) {
            DB::table('settings')->insert([
                'key' => 'thanks_message',
                'value' => '"Thank you, fairy✨
We will verify your payment within 24 hours. Once confirmed, your order will be carefully packed just for you. 💕
You’ll receive a shipping confirmation via email or Instagram (if you’ve provided your username) and your one-of-a-kind piece should arrive within 3-5 business days. Timeless style is worth the wait! 💌🌸"',
                'type' => 'string',
                'display_name' => 'Thank you message',
                'description' => 'Shown as a thank-you note after the order. Supports text, links, and images.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->where('key', 'thanks_message')->delete();
    }
};
