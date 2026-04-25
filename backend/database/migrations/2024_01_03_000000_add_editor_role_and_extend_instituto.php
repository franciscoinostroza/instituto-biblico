<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Agregar rol 'editor' al CHECK constraint de PostgreSQL
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'docente', 'estudiante', 'editor'))");

        // 2. Campo 'periodo' en noticias_instituto
        Schema::table('noticias_instituto', function (Blueprint $table) {
            $table->string('periodo', 20)->default('general')->after('published_at');
            // 'general' | 'semanal' | 'mensual' | 'anual'
        });

        // 3. Campos adicionales en documentos_instituto
        DB::statement("ALTER TABLE documentos_instituto ALTER COLUMN file_path DROP NOT NULL");
        Schema::table('documentos_instituto', function (Blueprint $table) {
            $table->string('description')->nullable()->after('title');
            $table->string('url', 500)->nullable()->after('file_path');
        });
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'docente', 'estudiante'))");

        Schema::table('noticias_instituto', function (Blueprint $table) {
            $table->dropColumn('periodo');
        });

        Schema::table('documentos_instituto', function (Blueprint $table) {
            $table->dropColumn(['description', 'url']);
        });
    }
};
