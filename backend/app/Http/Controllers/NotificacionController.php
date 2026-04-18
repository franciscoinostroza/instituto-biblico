<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notificaciones = $request->user()
            ->notificaciones()
            ->orderByDesc('created_at')
            ->paginate(20);

        $noLeidas = $request->user()
            ->notificaciones()
            ->whereNull('leida_at')
            ->count();

        return response()->json([
            'notificaciones' => $notificaciones,
            'no_leidas'      => $noLeidas,
        ]);
    }

    public function marcarLeida(Request $request, int $id): JsonResponse
    {
        $notificacion = $request->user()
            ->notificaciones()
            ->findOrFail($id);

        $notificacion->update(['leida_at' => now()]);

        return response()->json($notificacion);
    }

    public function marcarTodasLeidas(Request $request): JsonResponse
    {
        $request->user()
            ->notificaciones()
            ->whereNull('leida_at')
            ->update(['leida_at' => now()]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas.']);
    }
}
