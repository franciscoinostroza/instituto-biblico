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
            ->orderBy('title')
            ->get();

        return response()->json($documentos);
    }

    public function store(StoreDocumentoRequest $request): JsonResponse
    {
        $path = $request->file('file')->store('documentos', 's3');

        $documento = DocumentoInstituto::create([
            'title'     => $request->title,
            'file_path' => $path,
            'category'  => $request->category,
        ]);

        return response()->json($documento, 201);
    }

    public function destroy(DocumentoInstituto $documento): JsonResponse
    {
        Storage::disk('s3')->delete($documento->file_path);
        $documento->delete();

        return response()->json(['message' => 'Documento eliminado.']);
    }

    public function descargar(DocumentoInstituto $documento): \Illuminate\Http\RedirectResponse
    {
        $url = Storage::disk('s3')->temporaryUrl($documento->file_path, now()->addMinutes(5));
        return redirect($url);
    }
}
