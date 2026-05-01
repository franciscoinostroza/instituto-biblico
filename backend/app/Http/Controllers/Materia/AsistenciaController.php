<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Materia;
use App\Models\RegistroAsistencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $user = $request->user();

        if ($user->isEstudiante()) {
            // Devuelve los registros propios del estudiante con la asistencia parent
            $registros = RegistroAsistencia::with('asistencia')
                ->whereHas('asistencia', fn($q) => $q->where('materia_id', $materia->id))
                ->where('estudiante_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($registro) {
                    return [
                        'id'           => $registro->id,
                        'estado'       => $registro->estado,
                        'observacion'  => $registro->observacion,
                        'asistencia'   => [
                            'id'          => $registro->asistencia->id,
                            'fecha'       => $registro->asistencia->fecha,
                            'descripcion' => $registro->asistencia->descripcion,
                        ],
                    ];
                });

            return response()->json(['data' => $registros]);
        }

        // Docente / admin: lista de asistencias con sus registros y totales
        $asistencias = Asistencia::with(['registros.estudiante:id,name'])
            ->where('materia_id', $materia->id)
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function ($asistencia) {
                $registros = $asistencia->registros;
                return [
                    'id'          => $asistencia->id,
                    'fecha'       => $asistencia->fecha,
                    'descripcion' => $asistencia->descripcion,
                    'totales'     => [
                        'presentes'    => $registros->where('estado', 'presente')->count(),
                        'ausentes'     => $registros->where('estado', 'ausente')->count(),
                        'tardanzas'    => $registros->where('estado', 'tardanza')->count(),
                        'justificados' => $registros->where('estado', 'justificado')->count(),
                        'total'        => $registros->count(),
                    ],
                    'registros'   => $registros->map(fn($r) => [
                        'id'          => $r->id,
                        'estado'      => $r->estado,
                        'observacion' => $r->observacion,
                        'estudiante'  => [
                            'id'   => $r->estudiante->id,
                            'name' => $r->estudiante->name,
                        ],
                    ]),
                ];
            });

        return response()->json(['data' => $asistencias]);
    }

    public function store(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $validated = $request->validate([
            'fecha'                      => ['required', 'date'],
            'descripcion'                => ['nullable', 'string'],
            'registros'                  => ['nullable', 'array'],
            'registros.*.estudiante_id'  => ['required_with:registros', 'integer', 'exists:users,id'],
            'registros.*.estado'         => ['required_with:registros', 'in:presente,ausente,tardanza,justificado'],
            'registros.*.observacion'    => ['nullable', 'string'],
        ]);

        $asistencia = Asistencia::create([
            'materia_id'  => $materia->id,
            'fecha'       => $validated['fecha'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        if (!empty($validated['registros'])) {
            foreach ($validated['registros'] as $reg) {
                RegistroAsistencia::create([
                    'asistencia_id' => $asistencia->id,
                    'estudiante_id' => $reg['estudiante_id'],
                    'estado'        => $reg['estado'],
                    'observacion'   => $reg['observacion'] ?? null,
                ]);
            }
        } else {
            // Auto-crear "ausente" para todos los estudiantes inscritos activos
            $estudiantes = $materia->estudiantes()->wherePivot('active', true)->get();
            foreach ($estudiantes as $estudiante) {
                RegistroAsistencia::create([
                    'asistencia_id' => $asistencia->id,
                    'estudiante_id' => $estudiante->id,
                    'estado'        => 'ausente',
                    'observacion'   => null,
                ]);
            }
        }

        $asistencia->load(['registros.estudiante:id,name']);

        return response()->json(['data' => $asistencia], 201);
    }

    public function show(Materia $materia, Asistencia $asistencia): JsonResponse
    {
        $this->authorize('view', $materia);

        $asistencia->load(['registros.estudiante:id,name']);

        return response()->json(['data' => $asistencia]);
    }

    public function update(Request $request, Materia $materia, Asistencia $asistencia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $validated = $request->validate([
            'registros'                  => ['required', 'array'],
            'registros.*.estudiante_id'  => ['required', 'integer', 'exists:users,id'],
            'registros.*.estado'         => ['required', 'in:presente,ausente,tardanza,justificado'],
            'registros.*.observacion'    => ['nullable', 'string'],
        ]);

        foreach ($validated['registros'] as $reg) {
            RegistroAsistencia::updateOrCreate(
                [
                    'asistencia_id' => $asistencia->id,
                    'estudiante_id' => $reg['estudiante_id'],
                ],
                [
                    'estado'      => $reg['estado'],
                    'observacion' => $reg['observacion'] ?? null,
                ]
            );
        }

        $asistencia->load(['registros.estudiante:id,name']);

        return response()->json(['data' => $asistencia]);
    }

    public function destroy(Materia $materia, Asistencia $asistencia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $asistencia->delete();

        return response()->json(['message' => 'Asistencia eliminada correctamente.']);
    }

    public function resumen(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $asistencias = Asistencia::where('materia_id', $materia->id)->pluck('id');
        $totalClases = $asistencias->count();

        $estudiantes = $materia->estudiantes()->wherePivot('active', true)->get(['users.id', 'users.name']);

        $resumen = $estudiantes->map(function ($estudiante) use ($asistencias, $totalClases) {
            $registros = RegistroAsistencia::whereIn('asistencia_id', $asistencias)
                ->where('estudiante_id', $estudiante->id)
                ->get();

            $presentes   = $registros->where('estado', 'presente')->count();
            $ausentes    = $registros->where('estado', 'ausente')->count();
            $tardanzas   = $registros->where('estado', 'tardanza')->count();
            $justificados = $registros->where('estado', 'justificado')->count();

            $porcentaje = $totalClases > 0
                ? round(($presentes + $tardanzas + $justificados) / $totalClases * 100, 2)
                : null;

            return [
                'estudiante'   => [
                    'id'   => $estudiante->id,
                    'name' => $estudiante->name,
                ],
                'total_clases'  => $totalClases,
                'presentes'     => $presentes,
                'ausentes'      => $ausentes,
                'tardanzas'     => $tardanzas,
                'justificados'  => $justificados,
                'porcentaje_asistencia' => $porcentaje,
            ];
        });

        return response()->json(['data' => $resumen]);
    }
}
