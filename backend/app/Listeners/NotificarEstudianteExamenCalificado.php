<?php

namespace App\Listeners;

use App\Events\ExamenCalificado;
use App\Models\Notificacion;

class NotificarEstudianteExamenCalificado
{
    public function handle(ExamenCalificado $event): void
    {
        $intento = $event->intento->load(['examen.materia', 'estudiante:id,name']);
        $examen  = $intento->examen;
        $materia = $examen->materia;

        $tipo = $examen->tipo === 'control_lectura' ? 'Control de lectura' : 'Examen';

        Notificacion::create([
            'user_id'     => $intento->estudiante_id,
            'tipo'        => 'examen_calificado',
            'titulo'      => "{$tipo} calificado",
            'body'        => "Tu \"{$examen->title}\" en {$materia->name} fue calificado. Nota: {$intento->nota_final}",
            'url_destino' => "/materias/{$materia->id}/notas",
        ]);
    }
}
