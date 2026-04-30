<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\StoreNotaRequest;
use App\Models\Materia;
use App\Models\Nota;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotaController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $user = $request->user();

        if ($user->isEstudiante()) {
            $notas = $materia->notas()
                ->where('estudiante_id', $user->id)
                ->orderByDesc('created_at')
                ->get();

            return response()->json($notas);
        }

        // Docente/Admin: libro de calificaciones completo
        $this->authorize('viewLibro', [Nota::class, $materia]);

        $estudiantes = $materia->estudiantes()
            ->wherePivot('active', true)
            ->select('users.id', 'users.name', 'users.email')
            ->get();

        $notas = $materia->notas()
            ->orderBy('estudiante_id')
            ->orderBy('tipo')
            ->get()
            ->groupBy('estudiante_id');

        $libro = $estudiantes->map(function ($estudiante) use ($notas) {
            $notasEstudiante = $notas->get($estudiante->id, collect());
            $promedio = $notasEstudiante->isNotEmpty()
                ? round($notasEstudiante->avg(fn($n) => ($n->nota / $n->puntaje_maximo) * 100), 2)
                : null;

            return [
                'estudiante' => $estudiante,
                'notas'      => $notasEstudiante,
                'promedio'   => $promedio,
            ];
        });

        return response()->json($libro);
    }

    public function store(StoreNotaRequest $request, Materia $materia): JsonResponse
    {
        $this->authorize('create', [Nota::class, $materia]);

        $data = $request->validated();
        $data['fecha'] ??= now()->toDateString();
        $nota = $materia->notas()->create($data);

        return response()->json($nota->load('estudiante:id,name'), 201);
    }

    public function update(Request $request, Materia $materia, Nota $nota): JsonResponse
    {
        $this->authorize('update', $nota);

        $data = $request->validate([
            'nota'           => ['sometimes', 'numeric', 'min:0'],
            'descripcion'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'puntaje_maximo' => ['sometimes', 'integer', 'min:1'],
            'fecha'          => ['sometimes', 'nullable', 'date'],
        ]);

        $nota->update($data);
        return response()->json($nota);
    }

    public function destroy(Materia $materia, Nota $nota): JsonResponse
    {
        $this->authorize('delete', $nota);

        $nota->delete();
        return response()->json(['message' => 'Nota eliminada.']);
    }
}
