<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entregas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tarea_id')->constrained('tareas')->cascadeOnDelete();
            $table->foreignId('estudiante_id')->constrained('users')->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->text('comentario_alumno')->nullable();
            $table->decimal('nota', 5, 2)->nullable();
            $table->text('comentario_docente')->nullable();
            $table->timestamp('calificado_at')->nullable();
            $table->timestamps();

            $table->unique(['tarea_id', 'estudiante_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entregas');
    }
};
