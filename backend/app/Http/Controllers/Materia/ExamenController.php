<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\StoreExamenRequest;
use App\Models\Examen;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $user     = $request->user();
        $examenes = $materia->examenes()->orderByDesc('fecha_apertura')->get();

        if ($user->isEstudiante()) {
            $examenes->each(function ($examen) use ($user) {
                $examen->mis_intentos = $examen->intentos()
                    ->where('estudiante_id', $user->id)
                    ->get(['id', 'estado', 'nota_final', 'iniciado_at', 'finalizado_at']);
            });
        } else {
            $examenes->loadCount('intentos');
        }

        return response()->json($examenes);
    }

    public function store(StoreExamenRequest $request, Materia $materia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $examen = $materia->examenes()->create($request->validated());
        return response()->json($examen, 201);
    }

    public function show(Request $request, Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('view', $materia);

        $user = $request->user();

        // Estudiantes no ven respuestas correctas
        if ($user->isEstudiante()) {
            $examen->load(['preguntas' => function ($q) {
                $q->with(['opciones' => function ($o) {
                    $o->select('id', 'pregunta_id', 'texto');
                }]);
            }]);
        } else {
            $examen->load(['preguntas.opciones']);
        }

        return response()->json($examen);
    }

    public function update(StoreExamenRequest $request, Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $examen->update($request->validated());
        return response()->json($examen);
    }

    public function destroy(Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $examen->delete();
        return response()->json(['message' => 'Examen eliminado.']);
    }
}
