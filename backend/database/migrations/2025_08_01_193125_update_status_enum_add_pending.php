<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

class UpdateStatusEnumAddPending extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE products MODIFY status ENUM('Available', 'Sold', 'Pending') DEFAULT 'Available'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE products MODIFY status ENUM('Available', 'Sold') DEFAULT 'Available'");
    }
}