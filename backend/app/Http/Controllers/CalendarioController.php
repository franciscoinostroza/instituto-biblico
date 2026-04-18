<?php

namespace App\Http\Controllers;

use App\Http\Requests\Instituto\StoreCalendarioRequest;
use App\Models\CalendarioAcademico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $eventos = CalendarioAcademico::query()
            ->when($request->mes && $request->anio, function ($q) use ($request) {
                $q->whereYear('date_start', $request->anio)
                  ->whereMonth('date_start', $request->mes);
            })
            ->orderBy('date_start')
            ->get();

        return response()->json($eventos);
    }

    public function store(StoreCalendarioRequest $request): JsonResponse
    {
        return response()->json(CalendarioAcademico::create($request->validated()), 201);
    }

    public function update(StoreCalendarioRequest $request, CalendarioAcademico $evento): JsonResponse
    {
        $evento->update($request->validated());
        return response()->json($evento);
    }

    public function destroy(CalendarioAcademico $evento): JsonResponse
    {
        $evento->delete();
        return response()->json(['message' => 'Evento eliminado.']);
    }
}
