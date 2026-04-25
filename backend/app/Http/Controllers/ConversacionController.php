<?php

namespace App\Http\Controllers;

use App\Events\NuevoMensaje;
use App\Http\Requests\EnviarMensajeRequest;
use App\Http\Requests\StoreConversacionRequest;
use App\Models\Conversacion;
use App\Models\Mensaje;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversaciones = $user->conversaciones()
            ->with(['participantes:id,name,avatar', 'ultimoMensaje'])
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($conversaciones);
    }

    public function store(StoreConversacionRequest $request): JsonResponse
    {
        $user        = $request->user();
        $otroUsuario = User::findOrFail($request->participante_id);

        // Buscar conversación existente entre los dos usuarios (dos whereHas separados evitan
        // el JOIN ambiguo en PostgreSQL que ocurre al anidar whereHas sobre BelongsToMany)
        $existente = Conversacion::whereHas('participantes', fn($q) => $q->where('id', $user->id))
            ->whereHas('participantes', fn($q) => $q->where('id', $otroUsuario->id))
            ->first();

        if ($existente) {
            return response()->json($existente->load('participantes:id,name,avatar'));
        }

        $conversacion = new Conversacion();
        $conversacion->save();
        $conversacion->participantes()->attach([$user->id, $otroUsuario->id]);

        return response()->json($conversacion->load('participantes:id,name,avatar'), 201);
    }

    public function mensajes(Request $request, Conversacion $conversacion): JsonResponse
    {
        $this->verificarParticipante($request->user(), $conversacion);

        $mensajes = $conversacion->mensajes()
            ->with('sender:id,name,avatar')
            ->orderBy('created_at')
            ->paginate(50);

        // Marcar como leídos los mensajes del otro
        $conversacion->mensajes()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('leido_at')
            ->update(['leido_at' => now()]);

        return response()->json($mensajes);
    }

    public function enviarMensaje(EnviarMensajeRequest $request, Conversacion $conversacion): JsonResponse
    {
        $this->verificarParticipante($request->user(), $conversacion);

        $mensaje = $conversacion->mensajes()->create([
            'sender_id' => $request->user()->id,
            'body'      => $request->body,
        ]);

        $mensaje->load('sender:id,name,avatar');

        $conversacion->touch();

        NuevoMensaje::dispatch($mensaje, $conversacion);

        return response()->json($mensaje, 201);
    }

    private function verificarParticipante(User $user, Conversacion $conversacion): void
    {
        $esParticipante = $conversacion->participantes()
            ->where('id', $user->id)
            ->exists();

        abort_unless($esParticipante, 403, 'No tenés acceso a esta conversación.');
    }
}
