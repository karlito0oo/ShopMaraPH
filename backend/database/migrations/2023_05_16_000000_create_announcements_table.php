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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('text');
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();
            $table->string('background_color')->default('#000000');
            $table->string('text_color')->default('#FFFFFF');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
}; 