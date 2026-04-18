<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMateriaRequest;
use App\Http\Requests\Admin\UpdateMateriaRequest;
use App\Models\Inscripcion;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMateriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $materias = Materia::with(['carrera', 'periodo', 'docente'])
            ->when($request->carrera_id, fn($q, $v) => $q->where('carrera_id', $v))
            ->when($request->periodo_id, fn($q, $v) => $q->where('periodo_id', $v))
            ->withCount('inscripciones')
            ->orderBy('name')
            ->paginate(20);

        return response()->json($materias);
    }

    public function store(StoreMateriaRequest $request): JsonResponse
    {
        $materia = Materia::create($request->validated());
        return response()->json($materia->load(['carrera', 'periodo', 'docente']), 201);
    }

    public function show(Materia $materia): JsonResponse
    {
        return response()->json(
            $materia->load(['carrera', 'periodo', 'docente', 'estudiantes'])
        );
    }

    public function update(UpdateMateriaRequest $request, Materia $materia): JsonResponse
    {
        $materia->update($request->validated());
        return response()->json($materia->load(['carrera', 'periodo', 'docente']));
    }

    public function destroy(Materia $materia): JsonResponse
    {
        $materia->delete();
        return response()->json(['message' => 'Materia eliminada.']);
    }

    public function asignarDocente(Request $request, Materia $materia): JsonResponse
    {
        $request->validate([
            'docente_id' => ['required', 'exists:users,id'],
        ]);

        $docente = User::findOrFail($request->docente_id);

        if (!$docente->isDocente()) {
            return response()->json(['message' => 'El usuario no tiene rol de docente.'], 422);
        }

        $materia->update(['docente_id' => $docente->id]);
        return response()->json($materia->load('docente'));
    }

    public function inscribirEstudiantes(Request $request, Materia $materia): JsonResponse
    {
        $request->validate([
            'estudiante_ids'   => ['required', 'array'],
            'estudiante_ids.*' => ['exists:users,id'],
        ]);

        $inscritos = [];
        foreach ($request->estudiante_ids as $estudianteId) {
            $inscritos[] = Inscripcion::firstOrCreate(
                ['materia_id' => $materia->id, 'estudiante_id' => $estudianteId],
                ['fecha_inscripcion' => now(), 'active' => true]
            );
        }

        return response()->json(['message' => 'Estudiantes inscriptos.', 'inscritos' => count($inscritos)]);
    }

    public function desinscribirEstudiante(Materia $materia, User $estudiante): JsonResponse
    {
        Inscripcion::where('materia_id', $materia->id)
            ->where('estudiante_id', $estudiante->id)
            ->update(['active' => false]);

        return response()->json(['message' => 'Estudiante desinscripto.']);
    }
}
