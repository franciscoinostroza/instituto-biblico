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
            $asistencias = Asistencia::with(['registros' => function ($q) use ($user) {
                $q->where('estudiante_id', $user->id);
            }])
                ->where('materia_id', $materia->id)
                ->whereHas('registros', fn($q) => $q->where('estudiante_id', $user->id))
                ->orderBy('fecha', 'desc')
                ->get()
                ->map(fn($a) => [
                    'id'          => $a->id,
                    'fecha'       => $a->fecha,
                    'descripcion' => $a->descripcion,
                    'registros'   => $a->registros->map(fn($r) => [
                        'id'           => $r->id,
                        'estudiante_id' => $r->estudiante_id,
                        'estado'       => $r->estado,
                        'observacion'  => $r->observacion,
                        'estudiante'   => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
                    ]),
                ]);

            return response()->json($asistencias);
        }

        $asistencias = Asistencia::with(['registros.estudiante:id,name,email'])
            ->where('materia_id', $materia->id)
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function ($a) {
                $registros = $a->registros;
                return [
                    'id'          => $a->id,
                    'fecha'       => $a->fecha,
                    'descripcion' => $a->descripcion,
                    'presentes'   => $registros->where('estado', 'presente')->count(),
                    'ausentes'    => $registros->where('estado', 'ausente')->count(),
                    'tardanzas'   => $registros->where('estado', 'tardanza')->count(),
                    'registros'   => $registros->map(fn($r) => [
                        'id'           => $r->id,
                        'estudiante_id' => $r->estudiante_id,
                        'estado'       => $r->estado,
                        'observacion'  => $r->observacion,
                        'estudiante'   => [
                            'id'    => $r->estudiante->id,
                            'name'  => $r->estudiante->name,
                            'email' => $r->estudiante->email,
                        ],
                    ]),
                ];
            });

        return response()->json($asistencias);
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

        $asistencia->load(['registros.estudiante:id,name,email']);

        $registros = $asistencia->registros;
        return response()->json([
            'id'          => $asistencia->id,
            'fecha'       => $asistencia->fecha,
            'descripcion' => $asistencia->descripcion,
            'presentes'   => $registros->where('estado', 'presente')->count(),
            'ausentes'    => $registros->where('estado', 'ausente')->count(),
            'tardanzas'   => $registros->where('estado', 'tardanza')->count(),
            'registros'   => $registros->map(fn($r) => [
                'id'           => $r->id,
                'estudiante_id' => $r->estudiante_id,
                'estado'       => $r->estado,
                'observacion'  => $r->observacion,
                'estudiante'   => ['id' => $r->estudiante->id, 'name' => $r->estudiante->name, 'email' => $r->estudiante->email],
            ]),
        ], 201);
    }

    public function show(Materia $materia, Asistencia $asistencia): JsonResponse
    {
        $this->authorize('view', $materia);

        $asistencia->load(['registros.estudiante:id,name,email']);
        $registros = $asistencia->registros;

        return response()->json([
            'id'          => $asistencia->id,
            'fecha'       => $asistencia->fecha,
            'descripcion' => $asistencia->descripcion,
            'presentes'   => $registros->where('estado', 'presente')->count(),
            'ausentes'    => $registros->where('estado', 'ausente')->count(),
            'tardanzas'   => $registros->where('estado', 'tardanza')->count(),
            'registros'   => $registros->map(fn($r) => [
                'id'           => $r->id,
                'estudiante_id' => $r->estudiante_id,
                'estado'       => $r->estado,
                'observacion'  => $r->observacion,
                'estudiante'   => ['id' => $r->estudiante->id, 'name' => $r->estudiante->name, 'email' => $r->estudiante->email],
            ]),
        ]);
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
                ['asistencia_id' => $asistencia->id, 'estudiante_id' => $reg['estudiante_id']],
                ['estado' => $reg['estado'], 'observacion' => $reg['observacion'] ?? null]
            );
        }

        $asistencia->load(['registros.estudiante:id,name,email']);
        $registros = $asistencia->registros;

        return response()->json([
            'id'          => $asistencia->id,
            'fecha'       => $asistencia->fecha,
            'descripcion' => $asistencia->descripcion,
            'presentes'   => $registros->where('estado', 'presente')->count(),
            'ausentes'    => $registros->where('estado', 'ausente')->count(),
            'tardanzas'   => $registros->where('estado', 'tardanza')->count(),
            'registros'   => $registros->map(fn($r) => [
                'id'           => $r->id,
                'estudiante_id' => $r->estudiante_id,
                'estado'       => $r->estado,
                'observacion'  => $r->observacion,
                'estudiante'   => ['id' => $r->estudiante->id, 'name' => $r->estudiante->name, 'email' => $r->estudiante->email],
            ]),
        ]);
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

        $user = $request->user();
        $asistenciaIds = Asistencia::where('materia_id', $materia->id)->pluck('id');
        $totalClases   = $asistenciaIds->count();

        // Estudiante: devuelve solo su propio resumen
        if ($user->isEstudiante()) {
            $registros    = RegistroAsistencia::whereIn('asistencia_id', $asistenciaIds)
                ->where('estudiante_id', $user->id)
                ->get();

            $presentes    = $registros->where('estado', 'presente')->count();
            $tardanzas    = $registros->where('estado', 'tardanza')->count();
            $justificados = $registros->where('estado', 'justificado')->count();
            $ausentes     = $registros->where('estado', 'ausente')->count();

            return response()->json([
                'total_clases'          => $totalClases,
                'presentes'             => $presentes,
                'ausentes'              => $ausentes,
                'tardanzas'             => $tardanzas,
                'justificados'          => $justificados,
                'porcentaje_asistencia' => $totalClases > 0
                    ? round(($presentes + $tardanzas + $justificados) / $totalClases * 100, 2)
                    : null,
            ]);
        }

        // Docente / admin: devuelve resumen por estudiante
        $estudiantes = $materia->estudiantes()->wherePivot('active', true)->get(['users.id', 'users.name']);

        $resumen = $estudiantes->map(function ($estudiante) use ($asistenciaIds, $totalClases) {
            $registros    = RegistroAsistencia::whereIn('asistencia_id', $asistenciaIds)
                ->where('estudiante_id', $estudiante->id)
                ->get();

            $presentes    = $registros->where('estado', 'presente')->count();
            $tardanzas    = $registros->where('estado', 'tardanza')->count();
            $justificados = $registros->where('estado', 'justificado')->count();

            return [
                'estudiante'            => ['id' => $estudiante->id, 'name' => $estudiante->name],
                'total_clases'          => $totalClases,
                'presentes'             => $presentes,
                'ausentes'              => $registros->where('estado', 'ausente')->count(),
                'tardanzas'             => $tardanzas,
                'justificados'          => $justificados,
                'porcentaje_asistencia' => $totalClases > 0
                    ? round(($presentes + $tardanzas + $justificados) / $totalClases * 100, 2)
                    : null,
            ];
        });

        return response()->json($resumen);
    }
}
