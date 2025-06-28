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
        // Only insert if not exists
        if (!DB::table('settings')->where('key', 'product_hold_duration')->exists()) {
            DB::table('settings')->insert([
                'key' => 'product_hold_duration',
                'value' => '30',
                'type' => 'integer',
                'display_name' => 'Product Hold Duration (minutes)',
                'description' => 'How long a product will be held for a customer during checkout before being released back to available status.',
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
        DB::table('settings')->where('key', 'product_hold_duration')->delete();
    }
}; 