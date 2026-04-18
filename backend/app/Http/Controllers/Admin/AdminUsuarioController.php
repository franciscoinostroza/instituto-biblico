<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUsuarioRequest;
use App\Http\Requests\Admin\UpdateUsuarioRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminUsuarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $usuarios = User::query()
            ->when($request->role, fn($q, $r) => $q->where('role', $r))
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%");
            }))
            ->orderBy('name')
            ->paginate(20);

        return response()->json($usuarios);
    }

    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        $usuario = User::create($request->validated());
        return response()->json($usuario, 201);
    }

    public function show(User $usuario): JsonResponse
    {
        return response()->json($usuario);
    }

    public function update(UpdateUsuarioRequest $request, User $usuario): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($usuario->avatar) Storage::disk('s3')->delete($usuario->avatar);
            $data['avatar'] = $request->file('avatar')->store('avatars', 's3');
        }

        $usuario->update($data);
        return response()->json($usuario);
    }

    public function destroy(User $usuario): JsonResponse
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function toggleActive(User $usuario): JsonResponse
    {
        $usuario->update(['active' => !$usuario->active]);
        return response()->json($usuario);
    }
}
