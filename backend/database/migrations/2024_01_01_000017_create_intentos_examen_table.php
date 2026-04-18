<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intentos_examen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examen_id')->constrained('examenes')->cascadeOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('iniciado_at')->useCurrent();
            $table->timestamp('finalizado_at')->nullable();
            $table->decimal('nota_automatica', 5, 2)->nullable();
            $table->decimal('nota_desarrollo', 5, 2)->nullable();
            $table->decimal('nota_final', 5, 2)->nullable();
            $table->enum('estado', ['en_progreso', 'finalizado', 'calificado'])->default('en_progreso');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intentos_examen');
    }
};
