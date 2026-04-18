<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCarreraRequest;
use App\Http\Requests\Admin\UpdateCarreraRequest;
use App\Models\Carrera;
use Illuminate\Http\JsonResponse;

class AdminCarreraController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Carrera::withCount('materias')->orderBy('name')->get());
    }

    public function store(StoreCarreraRequest $request): JsonResponse
    {
        return response()->json(Carrera::create($request->validated()), 201);
    }

    public function show(Carrera $carrera): JsonResponse
    {
        return response()->json($carrera->load('materias'));
    }

    public function update(UpdateCarreraRequest $request, Carrera $carrera): JsonResponse
    {
        $carrera->update($request->validated());
        return response()->json($carrera);
    }

    public function destroy(Carrera $carrera): JsonResponse
    {
        $carrera->delete();
        return response()->json(['message' => 'Carrera eliminada.']);
    }
}
