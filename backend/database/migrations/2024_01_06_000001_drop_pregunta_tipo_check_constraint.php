<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE preguntas DROP CONSTRAINT IF EXISTS preguntas_tipo_check");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE preguntas ADD CONSTRAINT preguntas_tipo_check CHECK (tipo IN ('multiple_choice','verdadero_falso','desarrollo'))");
    }
};
