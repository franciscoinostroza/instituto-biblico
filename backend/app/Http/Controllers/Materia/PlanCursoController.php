<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\UpdatePlanCursoRequest;
use App\Models\Materia;
use App\Models\PlanDeCurso;
use Illuminate\Http\JsonResponse;

class PlanCursoController extends Controller
{
    public function show(Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $plan = $materia->planDeCurso ?? new PlanDeCurso(['materia_id' => $materia->id]);
        return response()->json($plan);
    }

    public function update(UpdatePlanCursoRequest $request, Materia $materia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $plan = PlanDeCurso::updateOrCreate(
            ['materia_id' => $materia->id],
            $request->validated()
        );

        return response()->json($plan);
    }
}
