<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\StoreTareaRequest;
use App\Models\Materia;
use App\Models\Tarea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TareaController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $user   = $request->user();
        $tareas = $materia->tareas()->orderByDesc('fecha_limite')->get();

        // Para estudiantes, agrego su entrega en cada tarea
        if ($user->isEstudiante()) {
            $tareas->each(function ($tarea) use ($user) {
                $tarea->mi_entrega = $tarea->entregas()
                    ->where('estudiante_id', $user->id)
                    ->first();
            });
        }

        // Para docentes, agrego conteo de entregas
        if ($user->isDocente() || $user->isAdmin()) {
            $tareas->loadCount('entregas');
        }

        return response()->json($tareas);
    }

    public function store(StoreTareaRequest $request, Materia $materia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $tarea = $materia->tareas()->create($request->validated());
        return response()->json($tarea, 201);
    }

    public function show(Request $request, Materia $materia, Tarea $tarea): JsonResponse
    {
        $this->authorize('view', $materia);

        $user = $request->user();
        $tarea->load([]);

        if ($user->isEstudiante()) {
            $tarea->mi_entrega = $tarea->entregas()
                ->where('estudiante_id', $user->id)
                ->first();
        } else {
            $tarea->load(['entregas.estudiante:id,name,avatar']);
        }

        return response()->json($tarea);
    }

    public function update(StoreTareaRequest $request, Materia $materia, Tarea $tarea): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $tarea->update($request->validated());
        return response()->json($tarea);
    }

    public function destroy(Materia $materia, Tarea $tarea): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $tarea->delete();
        return response()->json(['message' => 'Tarea eliminada.']);
    }
}
