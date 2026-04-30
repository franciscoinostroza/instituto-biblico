<?php

namespace App\Listeners;

use App\Events\NuevoNoticiaPublicada;
use App\Models\Notificacion;
use App\Models\User;

class NotificarUsuariosNuevaNoticia
{
    public function handle(NuevoNoticiaPublicada $event): void
    {
        $noticia = $event->noticia;
        $now = now();

        $userIds = User::where('active', true)
            ->where('id', '!=', $noticia->author_id)
            ->pluck('id');

        if ($userIds->isEmpty()) {
            return;
        }

        $notificaciones = $userIds->map(fn($userId) => [
            'user_id'     => $userId,
            'tipo'        => 'nueva_noticia_instituto',
            'titulo'      => 'Nueva publicación del instituto',
            'body'        => $noticia->title,
            'url_destino' => '/instituto',
            'created_at'  => $now,
            'updated_at'  => $now,
        ])->all();

        Notificacion::insert($notificaciones);
    }
}
