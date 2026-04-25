<?php

namespace App\Http\Controllers;

use App\Http\Requests\Instituto\StoreDocumentoRequest;
use App\Models\DocumentoInstituto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documentos = DocumentoInstituto::query()
            ->when($request->category, fn($q, $c) => $q->where('category', $c))
            ->orderBy('category')
            ->orderBy('title')
            ->get();

        return response()->json($documentos);
    }

    public function store(StoreDocumentoRequest $request): JsonResponse
    {
        $data = [
            'title'       => $request->title,
            'description' => $request->description,
            'category'    => $request->category,
        ];

        if ($request->filled('url')) {
            $data['url'] = $request->url;
        } elseif ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('documentos', 's3');
        }

        return response()->json(DocumentoInstituto::create($data), 201);
    }

    public function destroy(DocumentoInstituto $documento): JsonResponse
    {
        if ($documento->file_path) {
            Storage::disk('s3')->delete($documento->file_path);
        }
        $documento->delete();

        return response()->json(['message' => 'Documento eliminado.']);
    }

    public function descargar(DocumentoInstituto $documento): \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        if ($documento->url) {
            return redirect($documento->url);
        }
        $url = Storage::disk('s3')->temporaryUrl($documento->file_path, now()->addMinutes(5));
        return redirect($url);
    }
}
