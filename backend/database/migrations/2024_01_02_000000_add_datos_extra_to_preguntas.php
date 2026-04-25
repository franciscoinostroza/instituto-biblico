<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preguntas', function (Blueprint $table) {
            $table->json('datos_extra')->nullable()->after('puntaje');
        });

        Schema::table('respuestas_intento', function (Blueprint $table) {
            $table->json('respuesta_extra')->nullable()->after('texto_respuesta');
        });
    }

    public function down(): void
    {
        Schema::table('preguntas', function (Blueprint $table) {
            $table->dropColumn('datos_extra');
        });
        Schema::table('respuestas_intento', function (Blueprint $table) {
            $table->dropColumn('respuesta_extra');
        });
    }
};
