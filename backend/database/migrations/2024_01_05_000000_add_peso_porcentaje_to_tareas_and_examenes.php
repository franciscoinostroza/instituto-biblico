<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tareas', function (Blueprint $table) {
            $table->decimal('peso_porcentaje', 5, 2)->nullable()->after('puntaje_maximo');
        });

        Schema::table('examenes', function (Blueprint $table) {
            $table->decimal('peso_porcentaje', 5, 2)->nullable()->after('intentos_permitidos');
        });
    }

    public function down(): void
    {
        Schema::table('tareas', function (Blueprint $table) {
            $table->dropColumn('peso_porcentaje');
        });

        Schema::table('examenes', function (Blueprint $table) {
            $table->dropColumn('peso_porcentaje');
        });
    }
};
