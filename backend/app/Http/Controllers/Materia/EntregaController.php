<?php

namespace App\Http\Controllers\Materia;

use App\Events\TareaCalificada;
use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\CalificarEntregaRequest;
use App\Http\Requests\Materia\StoreEntregaRequest;
use App\Models\Entrega;
use App\Models\Materia;
use App\Models\Tarea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EntregaController extends Controller
{
    public function index(Request $request, Materia $materia, Tarea $tarea): JsonResponse
    {
        $this->authorize('viewAnyForMateria', [Entrega::class, $materia]);

        $entregas = $tarea->entregas()
            ->with('estudiante:id,name,email,avatar')
            ->orderBy('created_at')
            ->get();

        return response()->json($entregas);
    }

    public function store(StoreEntregaRequest $request, Materia $materia, Tarea $tarea): JsonResponse
    {
        $user = $request->user();
        $this->authorize('create', [Entrega::class, $tarea]);

        // Verificar fecha límite
        if ($tarea->fecha_limite && now()->isAfter($tarea->fecha_limite) && !$tarea->permite_entrega_tardia) {
            return response()->json(['message' => 'El plazo de entrega ha vencido.'], 422);
        }

        $entregaExistente = $tarea->entregas()->where('estudiante_id', $user->id)->first();

        $data = ['estudiante_id' => $user->id];

        if ($request->hasFile('file')) {
            if ($entregaExistente?->file_path) {
                Storage::disk('s3')->delete($entregaExistente->file_path);
            }
            $data['file_path'] = $request->file('file')->store(
                "entregas/{$tarea->id}", 's3'
            );
        }

        if ($request->filled('comentario_alumno')) {
            $data['comentario_alumno'] = $request->comentario_alumno;
        }

        $entrega = Entrega::updateOrCreate(
            ['tarea_id' => $tarea->id, 'estudiante_id' => $user->id],
            $data
        );

        return response()->json($entrega, 201);
    }

    public function calificar(CalificarEntregaRequest $request, Materia $materia, Tarea $tarea, Entrega $entrega): JsonResponse
    {
        $this->authorize('calificar', $entrega);

        $entrega->update([
            'nota'               => $request->nota,
            'comentario_docente' => $request->comentario_docente,
            'calificado_at'      => now(),
        ]);

        TareaCalificada::dispatch($entrega);

        return response()->json($entrega->load('estudiante:id,name'));
    }
}
