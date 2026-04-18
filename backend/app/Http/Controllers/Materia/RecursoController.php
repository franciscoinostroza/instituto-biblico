<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\StoreRecursoRequest;
use App\Models\Materia;
use App\Models\Recurso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RecursoController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $recursos = $materia->recursos()
            ->orderBy('unidad')
            ->orderBy('orden')
            ->get();

        return response()->json($recursos);
    }

    public function store(StoreRecursoRequest $request, Materia $materia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $data = $request->validated();

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store(
                "materias/{$materia->id}/recursos", 's3'
            );
        }

        unset($data['file']);
        $recurso = $materia->recursos()->create($data);

        return response()->json($recurso, 201);
    }

    public function destroy(Materia $materia, Recurso $recurso): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        if ($recurso->file_path) {
            Storage::disk('s3')->delete($recurso->file_path);
        }

        $recurso->delete();
        return response()->json(['message' => 'Recurso eliminado.']);
    }

    public function descargar(Materia $materia, Recurso $recurso): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('view', $materia);

        $url = Storage::disk('s3')->temporaryUrl($recurso->file_path, now()->addMinutes(5));
        return redirect($url);
    }
}
