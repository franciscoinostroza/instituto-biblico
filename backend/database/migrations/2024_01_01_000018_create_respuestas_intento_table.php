<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('respuestas_intento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intento_id')->constrained('intentos_examen')->cascadeOnDelete();
            $table->foreignId('pregunta_id')->constrained('preguntas')->cascadeOnDelete();
            $table->foreignId('opcion_id')->nullable()->constrained('opciones_respuesta')->nullOnDelete();
            $table->text('texto_respuesta')->nullable();
            $table->boolean('es_correcta')->nullable();
            $table->decimal('puntaje_obtenido', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['intento_id', 'pregunta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respuestas_intento');
    }
};
