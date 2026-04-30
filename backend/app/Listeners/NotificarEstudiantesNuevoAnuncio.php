<?php

namespace App\Listeners;

use App\Events\NuevoAnuncioPublicado;
use App\Models\Notificacion;

class NotificarEstudiantesNuevoAnuncio
{
    public function handle(NuevoAnuncioPublicado $event): void
    {
        $anuncio  = $event->anuncio;
        $materia  = $anuncio->materia;

        $estudiantes = $materia->estudiantes()
            ->wherePivot('active', true)
            ->get();

        $notificaciones = $estudiantes->map(fn($est) => [
            'user_id'      => $est->id,
            'tipo'         => 'nuevo_anuncio',
            'titulo'       => "Nuevo anuncio en {$materia->name}",
            'body'         => $anuncio->title,
            'url_destino'  => "/materias/{$materia->id}/anuncios",
            'created_at'   => now(),
            'updated_at'   => now(),
        ])->all();

        Notificacion::insert($notificaciones);
    }
}
