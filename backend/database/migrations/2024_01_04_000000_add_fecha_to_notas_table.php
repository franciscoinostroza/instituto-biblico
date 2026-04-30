<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notas', function (Blueprint $table) {
            $table->date('fecha')->nullable()->after('puntaje_maximo');
        });

        // Backfill existing rows with created_at date
        DB::statement('UPDATE notas SET fecha = DATE(created_at) WHERE fecha IS NULL');

        Schema::table('notas', function (Blueprint $table) {
            $table->date('fecha')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('notas', function (Blueprint $table) {
            $table->dropColumn('fecha');
        });
    }
};
