<?php

namespace App\Http\Controllers\Materia;

use App\Events\NuevoAnuncioPublicado;
use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\StoreAnuncioRequest;
use App\Models\Anuncio;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnuncioController extends Controller
{
    public function index(Request $request, Materia $materia): JsonResponse
    {
        $this->authorize('view', $materia);

        $anuncios = $materia->anuncios()
            ->with('autor:id,name,avatar')
            ->orderByDesc('published_at')
            ->get();

        return response()->json($anuncios);
    }

    public function store(StoreAnuncioRequest $request, Materia $materia): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $data = $request->validated();
        $data['autor_id']     = $request->user()->id;
        $data['published_at'] = $data['published_at'] ?? now();

        $anuncio = $materia->anuncios()->create($data);
        $anuncio->load('autor:id,name,avatar');

        NuevoAnuncioPublicado::dispatch($anuncio);

        return response()->json($anuncio, 201);
    }

    public function update(StoreAnuncioRequest $request, Materia $materia, Anuncio $anuncio): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $anuncio->update($request->validated());
        return response()->json($anuncio->load('autor:id,name,avatar'));
    }

    public function destroy(Materia $materia, Anuncio $anuncio): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $anuncio->delete();
        return response()->json(['message' => 'Anuncio eliminado.']);
    }
}
