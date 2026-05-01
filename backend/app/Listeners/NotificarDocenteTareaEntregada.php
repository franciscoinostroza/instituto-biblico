<?php

namespace App\Listeners;

use App\Events\TareaEntregada;
use App\Models\Notificacion;

class NotificarDocenteTareaEntregada
{
    public function handle(TareaEntregada $event): void
    {
        $entrega  = $event->entrega->load(['tarea.materia.docente', 'estudiante:id,name']);
        $tarea    = $entrega->tarea;
        $materia  = $tarea->materia;
        $docente  = $materia->docente;

        if (!$docente) return;

        Notificacion::create([
            'user_id'     => $docente->id,
            'tipo'        => 'tarea_entregada',
            'titulo'      => "Nueva entrega recibida",
            'body'        => "{$entrega->estudiante->name} entregó \"{$tarea->title}\" en {$materia->name}.",
            'url_destino' => "/materias/{$materia->id}/tareas",
        ]);
    }
}
