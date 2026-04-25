<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        $user = Auth::user();

        if (!$user->active) {
            Auth::logout();
            return response()->json(['message' => 'Tu cuenta está desactivada.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'name'             => 'sometimes|string|max:255',
            'phone'            => 'sometimes|nullable|string|max:20',
            'current_password' => 'required_with:password|string',
            'password'         => 'sometimes|nullable|string|min:8|confirmed',
            'avatar'           => 'sometimes|nullable|image|max:2048',
        ]);

        if ($request->filled('name'))  $user->name  = $request->name;
        if ($request->has('phone'))    $user->phone = $request->phone;

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'La contraseña actual es incorrecta.',
                    'errors'  => ['current_password' => ['La contraseña actual es incorrecta.']],
                ], 422);
            }
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 's3');
            $user->avatar = Storage::disk('s3')->url($path);
        }
        $user->save();

        return response()->json($user->fresh());
    }

    public function listarUsuarios(Request $request): JsonResponse
    {
        $usuarios = User::where('id', '!=', $request->user()->id)
            ->where('active', true)
            ->select(['id', 'name', 'email', 'role', 'avatar'])
            ->orderBy('name')
            ->get();

        return response()->json($usuarios);
    }
}
