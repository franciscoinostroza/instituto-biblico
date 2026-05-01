<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL doesn't allow adding new values to an enum easily.
        // Convert the column to varchar to support all question types.
        DB::statement("ALTER TABLE preguntas ALTER COLUMN tipo TYPE varchar(50)");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE preguntas ALTER COLUMN tipo TYPE varchar(50)");
    }
};
