<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Models\Materia;
use App\Models\Nota;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibroCalificacionesController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $user = $request->user();

        $isDocente = $user->isAdmin() || $user->isDocente();

        if ($isDocente) {
            $this->authorize('viewLibro', [Nota::class, $materia]);
        }

        // Cargar tareas con entregas
        $tareas = $materia->tareas()->with('entregas')->get();

        // Cargar examenes con intentos finalizados o calificados
        $examenes = $materia->examenes()->with(['intentos' => function ($query) {
            $query->whereIn('estado', ['finalizado', 'calificado']);
        }])->get();

        // Construir lista de actividades ordenadas por fecha
        $activities = collect();

        foreach ($tareas as $tarea) {
            $activities->push([
                'id'               => $tarea->id,
                'tipo'             => 'tarea',
                'title'            => $tarea->title,
                'peso_porcentaje'  => $tarea->peso_porcentaje !== null ? (float) $tarea->peso_porcentaje : null,
                'puntaje_maximo'   => (int) $tarea->puntaje_maximo,
                'fecha'            => $tarea->fecha_limite,
            ]);
        }

        foreach ($examenes as $examen) {
            $activities->push([
                'id'               => $examen->id,
                'tipo'             => $examen->tipo, // 'examen' or 'control_lectura'
                'title'            => $examen->title,
                'peso_porcentaje'  => $examen->peso_porcentaje !== null ? (float) $examen->peso_porcentaje : null,
                'puntaje_maximo'   => null,
                'fecha'            => $examen->fecha_apertura,
            ]);
        }

        // Ordenar por fecha (nulos al final)
        $activities = $activities->sortBy(function ($item) {
            return $item['fecha'] ?? '9999-12-31';
        })->values();

        $totalPesoConfigurado = $activities->sum(fn($a) => $a['peso_porcentaje'] ?? 0);

        if ($isDocente) {
            return $this->buildDocenteResponse($materia, $tareas, $examenes, $activities, $totalPesoConfigurado);
        }

        return $this->buildEstudianteResponse($user, $tareas, $examenes, $activities, $totalPesoConfigurado);
    }

    private function buildDocenteResponse(
        Materia $materia,
        $tareas,
        $examenes,
        $activities,
        float $totalPesoConfigurado
    ): JsonResponse {
        $estudiantes = $materia->estudiantes()
            ->wherePivot('active', true)
            ->get(['users.id', 'users.name', 'users.email']);

        $libro = $estudiantes->map(function ($estudiante) use ($tareas, $examenes, $activities) {
            $grades = $this->buildGrades($estudiante->id, $tareas, $examenes, $activities);
            $notaFinal = $this->calcularNotaFinal($activities, $grades);

            return [
                'estudiante'           => [
                    'id'    => $estudiante->id,
                    'name'  => $estudiante->name,
                    'email' => $estudiante->email,
                ],
                'grades'               => $grades,
                'nota_final_ponderada' => $notaFinal,
            ];
        });

        return response()->json([
            'activities'              => $activities,
            'libro'                   => $libro,
            'total_peso_configurado'  => (float) $totalPesoConfigurado,
        ]);
    }

    private function buildEstudianteResponse(
        $user,
        $tareas,
        $examenes,
        $activities,
        float $totalPesoConfigurado
    ): JsonResponse {
        $grades = $this->buildGrades($user->id, $tareas, $examenes, $activities);
        $notaFinal = $this->calcularNotaFinal($activities, $grades);

        return response()->json([
            'activities'              => $activities,
            'grades'                  => $grades,
            'nota_final_ponderada'    => $notaFinal,
            'total_peso_configurado'  => (float) $totalPesoConfigurado,
        ]);
    }

    private function buildGrades(int $estudianteId, $tareas, $examenes, $activities): array
    {
        $grades = [];

        foreach ($activities as $activity) {
            $nota = null;

            if ($activity['tipo'] === 'tarea') {
                $tarea = $tareas->firstWhere('id', $activity['id']);
                if ($tarea) {
                    $entrega = $tarea->entregas->firstWhere('estudiante_id', $estudianteId);
                    if ($entrega && $entrega->nota !== null) {
                        $nota = (float) $entrega->nota;
                    }
                }
            } else {
                // examen o control_lectura
                $examen = $examenes->firstWhere('id', $activity['id']);
                if ($examen) {
                    $intento = $examen->intentos
                        ->where('estudiante_id', $estudianteId)
                        ->whereNotNull('nota_final')
                        ->sortByDesc('nota_final')
                        ->first();
                    if ($intento) {
                        $nota = (float) $intento->nota_final;
                    }
                }
            }

            $grades[] = [
                'actividad_id' => $activity['id'],
                'tipo'         => $activity['tipo'],
                'nota'         => $nota,
            ];
        }

        return $grades;
    }

    private function calcularNotaFinal(
        $activities,
        array $grades
    ): ?float {
        $sumaPonderada = 0.0;
        $sumaPesos = 0.0;

        foreach ($activities as $index => $activity) {
            $peso = $activity['peso_porcentaje'] ?? null;
            $puntajeMaximo = $activity['puntaje_maximo'];
            $nota = $grades[$index]['nota'] ?? null;

            if ($peso === null || $peso <= 0 || $nota === null) {
                continue;
            }

            if ($puntajeMaximo !== null && $puntajeMaximo > 0) {
                // Tarea: normalizar sobre puntaje_maximo
                $notaNormalizada = ($nota / $puntajeMaximo) * 100;
            } else {
                // Examen/control: asumir nota ya está en escala 0-100
                $notaNormalizada = $nota;
            }

            $sumaPonderada += $notaNormalizada * ($peso / 100);
            $sumaPesos += $peso;
        }

        if ($sumaPesos <= 0) {
            return null;
        }

        return round($sumaPonderada / ($sumaPesos / 100), 2);
    }
}
