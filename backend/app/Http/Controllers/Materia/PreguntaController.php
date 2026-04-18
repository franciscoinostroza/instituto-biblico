<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\StorePreguntaRequest;
use App\Models\Examen;
use App\Models\Materia;
use App\Models\Pregunta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreguntaController extends Controller
{
    public function store(StorePreguntaRequest $request, Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $data = $request->validated();
        $opciones = $data['opciones'] ?? [];
        unset($data['opciones']);

        $pregunta = $examen->preguntas()->create($data);

        foreach ($opciones as $opcion) {
            $pregunta->opciones()->create($opcion);
        }

        return response()->json($pregunta->load('opciones'), 201);
    }

    public function update(StorePreguntaRequest $request, Materia $materia, Examen $examen, Pregunta $pregunta): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $data = $request->validated();
        $opciones = $data['opciones'] ?? null;
        unset($data['opciones']);

        $pregunta->update($data);

        if ($opciones !== null) {
            $pregunta->opciones()->delete();
            foreach ($opciones as $opcion) {
                $pregunta->opciones()->create($opcion);
            }
        }

        return response()->json($pregunta->load('opciones'));
    }

    public function destroy(Materia $materia, Examen $examen, Pregunta $pregunta): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $pregunta->delete();
        return response()->json(['message' => 'Pregunta eliminada.']);
    }

    public function reordenar(Request $request, Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $request->validate([
            'orden'    => ['required', 'array'],
            'orden.*'  => ['integer', 'exists:preguntas,id'],
        ]);

        foreach ($request->orden as $posicion => $preguntaId) {
            Pregunta::where('id', $preguntaId)
                ->where('examen_id', $examen->id)
                ->update(['orden' => $posicion]);
        }

        return response()->json(['message' => 'Orden actualizado.']);
    }
}
