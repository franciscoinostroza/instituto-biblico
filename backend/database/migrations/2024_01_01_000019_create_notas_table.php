<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materia_id')->constrained('materias')->cascadeOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
            $table->enum('tipo', ['tarea', 'examen', 'control_lectura', 'parcial', 'final', 'adicional']);
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('descripcion')->nullable();
            $table->decimal('nota', 5, 2);
            $table->unsignedSmallInteger('puntaje_maximo')->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
    }
};
