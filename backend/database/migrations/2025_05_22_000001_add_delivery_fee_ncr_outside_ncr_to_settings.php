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
        if (!DB::table('settings')->where('key', 'delivery_fee_ncr')->exists()) {
            DB::table('settings')->insert([
                [
                    'key' => 'delivery_fee_ncr',
                    'value' => '80',
                    'type' => 'integer',
                    'display_name' => 'Standard Delivery Fee Within NCR',
                    'description' => 'Standard delivery fee for addresses within NCR',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
        if (!DB::table('settings')->where('key', 'delivery_fee_outside_ncr')->exists()) {
            DB::table('settings')->insert([
                [
                    'key' => 'delivery_fee_outside_ncr',
                    'value' => '120',
                    'type' => 'integer',
                    'display_name' => 'Standard Delivery Fee Outside NCR',
                    'description' => 'Standard delivery fee for addresses outside NCR',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->where('key', 'delivery_fee_ncr')->delete();
        DB::table('settings')->where('key', 'delivery_fee_outside_ncr')->delete();
    }
}; 