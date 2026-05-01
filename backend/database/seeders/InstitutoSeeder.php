<?php

namespace Database\Seeders;

use App\Models\CalendarioAcademico;
use App\Models\DocumentoInstituto;
use App\Models\Instituto;
use App\Models\NoticiaInstituto;
use App\Models\User;
use Illuminate\Database\Seeder;

class InstitutoSeeder extends Seeder
{
    public function run(): void
    {
        Instituto::firstOrCreate(
            ['name' => 'Instituto Bíblico Shalom'],
            [
                'description' => 'Formando siervos de Dios con excelencia académica y espiritual desde 1995.',
                'address'     => 'Av. de la Fe 1234, Buenos Aires',
                'phone'       => '11-7777-7777',
                'email'       => 'info@institutoshalom.edu.ar',
                'website'     => 'https://institutoshalom.edu.ar',
            ]
        );

        $admin = User::where('role', 'admin')->first();

        NoticiaInstituto::firstOrCreate(
            ['title' => 'Bienvenidos al ciclo lectivo 2024'],
            [
                'body'         => 'Con gran alegría inauguramos un nuevo año académico. Les damos la bienvenida a todos los estudiantes, docentes y familias que forman parte de nuestra comunidad.',
                'author_id'    => $admin->id,
                'published_at' => now(),
            ]
        );

        NoticiaInstituto::firstOrCreate(
            ['title' => 'Inscripciones abiertas para nuevas carreras'],
            [
                'body'         => 'Informamos que las inscripciones para las carreras de Teología y Ministerio Pastoral están abiertas hasta el 31 de marzo. Comuníquese con secretaría para más información.',
                'author_id'    => $admin->id,
                'published_at' => now()->subDays(3),
            ]
        );

        DocumentoInstituto::firstOrCreate(
            ['title' => 'Reglamento Académico 2024'],
            ['file_path' => 'documentos/reglamento-2024.pdf', 'category' => 'reglamentos']
        );

        DocumentoInstituto::firstOrCreate(
            ['title' => 'Calendario Académico 2024'],
            ['file_path' => 'documentos/calendario-2024.pdf', 'category' => 'calendarios']
        );

        CalendarioAcademico::firstOrCreate(
            ['title' => 'Inicio del Primer Semestre'],
            [
                'description' => 'Comienzo de clases del primer semestre 2024.',
                'date_start'  => '2024-03-04',
                'date_end'    => '2024-03-04',
                'color'       => '#1E3A5F',
            ]
        );

        CalendarioAcademico::firstOrCreate(
            ['title' => 'Semana Santa — Asueto'],
            [
                'description' => 'Receso académico por Semana Santa.',
                'date_start'  => '2024-03-25',
                'date_end'    => '2024-03-29',
                'color'       => '#C9A84C',
            ]
        );

        CalendarioAcademico::firstOrCreate(
            ['title' => 'Exámenes Finales — Primer Semestre'],
            [
                'description' => 'Período de exámenes finales del primer semestre.',
                'date_start'  => '2024-07-01',
                'date_end'    => '2024-07-12',
                'color'       => '#DC2626',
            ]
        );
    }
}
