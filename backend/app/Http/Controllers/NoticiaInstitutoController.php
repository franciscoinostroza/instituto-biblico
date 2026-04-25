<?php

namespace App\Http\Controllers;

use App\Http\Requests\Instituto\StoreNoticiaRequest;
use App\Models\NoticiaInstituto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticiaInstitutoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $noticias = NoticiaInstituto::with('author:id,name')
            ->when($request->periodo, fn($q, $p) => $q->where('periodo', $p))
            ->orderByDesc('published_at')
            ->get();

        return response()->json($noticias);
    }

    public function store(StoreNoticiaRequest $request): JsonResponse
    {
        $noticia = NoticiaInstituto::create([
            ...$request->validated(),
            'author_id'    => $request->user()->id,
            'published_at' => $request->published_at ?? now(),
        ]);

        return response()->json($noticia->load('author:id,name'), 201);
    }

    public function show(NoticiaInstituto $noticia): JsonResponse
    {
        return response()->json($noticia->load('author:id,name'));
    }

    public function update(StoreNoticiaRequest $request, NoticiaInstituto $noticia): JsonResponse
    {
        $noticia->update($request->validated());
        return response()->json($noticia->load('author:id,name'));
    }

    public function destroy(NoticiaInstituto $noticia): JsonResponse
    {
        $noticia->delete();
        return response()->json(['message' => 'Noticia eliminada.']);
    }
}
