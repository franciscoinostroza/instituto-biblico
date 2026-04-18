<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_de_curso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materia_id')->unique()->constrained('materias')->cascadeOnDelete();
            $table->longText('content')->nullable();
            $table->text('objetivos')->nullable();
            $table->text('bibliografia')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_de_curso');
    }
};
