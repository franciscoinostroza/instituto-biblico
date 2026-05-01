<?php

namespace App\Listeners;

use App\Events\TareaCalificada;
use App\Models\Notificacion;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotificarTareaCalificada implements ShouldQueue
{
    public string $queue = 'notificaciones';

    public function handle(TareaCalificada $event): void
    {
        $entrega = $event->entrega;
        $tarea   = $entrega->tarea;
        $materia = $tarea->materia;

        Notificacion::create([
            'user_id'     => $entrega->estudiante_id,
            'tipo'        => 'tarea_calificada',
            'titulo'      => "Tu entrega fue calificada",
            'body'        => "Se calificó tu entrega de \"{$tarea->title}\" en {$materia->name}. Nota: {$entrega->nota}",
            'url_destino' => "/materias/{$materia->id}/tareas",
        ]);
    }
}
