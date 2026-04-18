<?php

namespace App\Listeners;

use App\Events\ExamenDisponible;
use App\Models\Notificacion;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotificarExamenDisponible implements ShouldQueue
{
    public string $queue = 'notificaciones';

    public function handle(ExamenDisponible $event): void
    {
        $examen  = $event->examen;
        $materia = $examen->materia;

        $estudiantes = $materia->estudiantes()
            ->wherePivot('active', true)
            ->get();

        $tipo = $examen->tipo === 'control_lectura' ? 'Control de lectura' : 'Examen';

        $notificaciones = $estudiantes->map(fn($est) => [
            'user_id'     => $est->id,
            'tipo'        => 'examen_disponible',
            'titulo'      => "{$tipo} disponible en {$materia->name}",
            'body'        => "\"{$examen->title}\" ya está disponible para rendir.",
            'url_destino' => "/materias/{$materia->id}/examenes/{$examen->id}",
            'created_at'  => now(),
            'updated_at'  => now(),
        ])->all();

        Notificacion::insert($notificaciones);
    }
}
