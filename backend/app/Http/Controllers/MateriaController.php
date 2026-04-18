<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user     = $request->user();
        $materias = collect();

        if ($user->isAdmin()) {
            $materias = Materia::with(['carrera', 'periodo', 'docente'])
                ->where('active', true)->get();
        } elseif ($user->isDocente()) {
            $materias = Materia::with(['carrera', 'periodo'])
                ->where('docente_id', $user->id)
                ->where('active', true)->get();
        } elseif ($user->isEstudiante()) {
            $materias = $user->materiasInscritas()
                ->where('materias.active', true)
                ->wherePivot('active', true)
                ->with(['carrera', 'periodo', 'docente'])
                ->get();
        }

        return response()->json($materias);
    }

    public function show(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        return response()->json(
            $materia->load(['carrera', 'periodo', 'docente'])
        );
    }
}
