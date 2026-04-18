<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePeriodoRequest;
use App\Models\PeriodoLectivo;
use Illuminate\Http\JsonResponse;

class AdminPeriodoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(PeriodoLectivo::orderByDesc('year')->orderBy('semester')->get());
    }

    public function store(StorePeriodoRequest $request): JsonResponse
    {
        return response()->json(PeriodoLectivo::create($request->validated()), 201);
    }

    public function show(PeriodoLectivo $periodo): JsonResponse
    {
        return response()->json($periodo);
    }

    public function update(StorePeriodoRequest $request, PeriodoLectivo $periodo): JsonResponse
    {
        $periodo->update($request->validated());
        return response()->json($periodo);
    }

    public function destroy(PeriodoLectivo $periodo): JsonResponse
    {
        $periodo->delete();
        return response()->json(['message' => 'Período eliminado.']);
    }
}
