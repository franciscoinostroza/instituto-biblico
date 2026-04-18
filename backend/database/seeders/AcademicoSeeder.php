<?php

namespace Database\Seeders;

use App\Models\Carrera;
use App\Models\PeriodoLectivo;
use App\Models\Materia;
use App\Models\Inscripcion;
use App\Models\PlanDeCurso;
use App\Models\Anuncio;
use App\Models\Tarea;
use App\Models\Examen;
use App\Models\Pregunta;
use App\Models\OpcionRespuesta;
use App\Models\User;
use Illuminate\Database\Seeder;

class AcademicoSeeder extends Seeder
{
    public function run(): void
    {
        // Carreras
        $teologia = Carrera::create([
            'name'        => 'Licenciatura en Teología',
            'description' => 'Formación integral en las ciencias teológicas con énfasis en la interpretación bíblica y la doctrina cristiana.',
            'active'      => true,
        ]);

        $ministerio = Carrera::create([
            'name'        => 'Ministerio Pastoral',
            'description' => 'Preparación para el liderazgo eclesial y el servicio pastoral en la iglesia local.',
            'active'      => true,
        ]);

        // Período lectivo
        $periodo = PeriodoLectivo::create([
            'name'       => 'Primer Semestre 2024',
            'year'       => 2024,
            'semester'   => 1,
            'date_start' => '2024-03-04',
            'date_end'   => '2024-07-19',
            'active'     => true,
        ]);

        $docente1 = User::where('email', 'docente@instituto.com')->first();
        $docente2 = User::where('email', 'docente2@instituto.com')->first();
        $est1     = User::where('email', 'estudiante@instituto.com')->first();
        $est2     = User::where('email', 'estudiante2@instituto.com')->first();
        $est3     = User::where('email', 'estudiante3@instituto.com')->first();

        // Materias
        $hermeneutica = Materia::create([
            'name'        => 'Hermenéutica Bíblica',
            'code'        => 'TEO-101',
            'description' => 'Principios y métodos para la correcta interpretación de las Sagradas Escrituras.',
            'carrera_id'  => $teologia->id,
            'periodo_id'  => $periodo->id,
            'docente_id'  => $docente1->id,
            'active'      => true,
        ]);

        $homiletica = Materia::create([
            'name'        => 'Homilética',
            'code'        => 'MIN-101',
            'description' => 'Arte y ciencia de la predicación cristiana efectiva.',
            'carrera_id'  => $ministerio->id,
            'periodo_id'  => $periodo->id,
            'docente_id'  => $docente2->id,
            'active'      => true,
        ]);

        $at = Materia::create([
            'name'        => 'Antiguo Testamento I',
            'code'        => 'TEO-102',
            'description' => 'Introducción a los libros históricos y poéticos del Antiguo Testamento.',
            'carrera_id'  => $teologia->id,
            'periodo_id'  => $periodo->id,
            'docente_id'  => $docente1->id,
            'active'      => true,
        ]);

        // Inscripciones
        foreach ([$est1, $est2, $est3] as $est) {
            Inscripcion::create([
                'materia_id'        => $hermeneutica->id,
                'estudiante_id'     => $est->id,
                'fecha_inscripcion' => now(),
                'active'            => true,
            ]);
        }

        foreach ([$est1, $est2] as $est) {
            Inscripcion::create([
                'materia_id'        => $homiletica->id,
                'estudiante_id'     => $est->id,
                'fecha_inscripcion' => now(),
                'active'            => true,
            ]);
        }

        Inscripcion::create([
            'materia_id'        => $at->id,
            'estudiante_id'     => $est3->id,
            'fecha_inscripcion' => now(),
            'active'            => true,
        ]);

        // Plan de curso
        PlanDeCurso::create([
            'materia_id'  => $hermeneutica->id,
            'content'     => "## Unidad 1: Introducción a la Hermenéutica\nDefinición, historia y necesidad de la hermenéutica bíblica.\n\n## Unidad 2: Principios Generales\nEl principio histórico-gramatical y el papel del Espíritu Santo.\n\n## Unidad 3: Géneros Literarios\nNarrativa, poesía, profecía, epístolas y apocalíptica.",
            'objetivos'   => "- Comprender los principios fundamentales de interpretación bíblica.\n- Aplicar métodos exegéticos a textos del Antiguo y Nuevo Testamento.\n- Desarrollar hábitos de estudio bíblico sistemático.",
            'bibliografia' => "- Fee, G. y Stuart, D. - *Cómo leer la Biblia para que valga la pena*\n- Ramm, B. - *Protestant Biblical Interpretation*\n- Klein, Blomberg y Hubbard - *Introduction to Biblical Interpretation*",
        ]);

        // Anuncios
        Anuncio::create([
            'materia_id'   => $hermeneutica->id,
            'autor_id'     => $docente1->id,
            'title'        => 'Bienvenidos a Hermenéutica Bíblica',
            'body'         => "Estimados estudiantes:\n\nBienvenidos a esta materia fundamental para su formación teológica. Les pido que lean el capítulo 1 del libro de Fee y Stuart antes de nuestra primera clase. Estamos ante un semestre apasionante.\n\nProf. Juan Pérez",
            'published_at' => now()->subDays(2),
        ]);

        Anuncio::create([
            'materia_id'   => $hermeneutica->id,
            'autor_id'     => $docente1->id,
            'title'        => 'Material del primer parcial disponible',
            'body'         => 'El material para el primer parcial ya está disponible en la sección de Recursos. El examen cubrirá las Unidades 1 y 2. Fecha: 15 de mayo.',
            'published_at' => now()->subDays(1),
        ]);

        // Tarea
        $tarea = Tarea::create([
            'materia_id'             => $hermeneutica->id,
            'title'                  => 'Análisis exegético — Salmo 23',
            'description'            => "Realizar un análisis exegético del Salmo 23 aplicando los principios hermenéuticos estudiados en clase.\n\n**Requisitos:**\n- Mínimo 1500 palabras\n- Incluir análisis histórico-gramatical\n- Contexto literario y teológico\n- Bibliografía en formato APA",
            'fecha_limite'           => now()->addDays(14),
            'puntaje_maximo'         => 100,
            'permite_entrega_tardia' => false,
        ]);

        // Examen con preguntas
        $examen = Examen::create([
            'materia_id'            => $hermeneutica->id,
            'title'                 => 'Control de Lectura — Fee & Stuart Cap. 1-3',
            'descripcion'           => 'Control de lectura sobre los primeros tres capítulos del libro de Fee y Stuart.',
            'tipo'                  => 'control_lectura',
            'fecha_apertura'        => now()->addDays(3),
            'fecha_cierre'          => now()->addDays(5),
            'tiempo_limite_minutos' => 30,
            'intentos_permitidos'   => 1,
        ]);

        $p1 = Pregunta::create([
            'examen_id'  => $examen->id,
            'enunciado'  => '¿Cuál es el objetivo principal de la hermenéutica bíblica?',
            'tipo'       => 'multiple_choice',
            'orden'      => 1,
            'puntaje'    => 2,
        ]);
        OpcionRespuesta::create(['pregunta_id' => $p1->id, 'texto' => 'Encontrar el significado que el autor original quiso comunicar.', 'es_correcta' => true]);
        OpcionRespuesta::create(['pregunta_id' => $p1->id, 'texto' => 'Adaptar el texto bíblico a la cultura contemporánea.', 'es_correcta' => false]);
        OpcionRespuesta::create(['pregunta_id' => $p1->id, 'texto' => 'Comparar las distintas traducciones de la Biblia.', 'es_correcta' => false]);
        OpcionRespuesta::create(['pregunta_id' => $p1->id, 'texto' => 'Memorizar los pasajes más importantes de la Escritura.', 'es_correcta' => false]);

        $p2 = Pregunta::create([
            'examen_id'  => $examen->id,
            'enunciado'  => 'El principio histórico-gramatical considera que el texto bíblico debe interpretarse según su contexto histórico y gramatical original.',
            'tipo'       => 'verdadero_falso',
            'orden'      => 2,
            'puntaje'    => 1,
        ]);
        OpcionRespuesta::create(['pregunta_id' => $p2->id, 'texto' => 'Verdadero', 'es_correcta' => true]);
        OpcionRespuesta::create(['pregunta_id' => $p2->id, 'texto' => 'Falso', 'es_correcta' => false]);

        $p3 = Pregunta::create([
            'examen_id'  => $examen->id,
            'enunciado'  => 'Explique con sus palabras por qué es necesaria la hermenéutica para la correcta comprensión de la Biblia.',
            'tipo'       => 'desarrollo',
            'orden'      => 3,
            'puntaje'    => 5,
        ]);
    }
}
