<?php

namespace App\Listeners;

use App\Events\ExamenEntregado;
use App\Models\Notificacion;

class NotificarDocenteExamenEntregado
{
    public function handle(ExamenEntregado $event): void
    {
        $intento  = $event->intento->load(['examen.materia.docente', 'estudiante:id,name']);
        $examen   = $intento->examen;
        $materia  = $examen->materia;
        $docente  = $materia->docente;

        if (!$docente) return;

        $tipo = $examen->tipo === 'control_lectura' ? 'Control de lectura' : 'Examen';

        Notificacion::create([
            'user_id'     => $docente->id,
            'tipo'        => 'examen_entregado',
            'titulo'      => "{$tipo} entregado",
            'body'        => "{$intento->estudiante->name} completó \"{$examen->title}\" en {$materia->name}.",
            'url_destino' => "/materias/{$materia->id}/examenes/{$examen->id}/resultados",
        ]);
    }
}
