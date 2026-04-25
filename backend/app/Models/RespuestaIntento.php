<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RespuestaIntento extends Model
{
    protected $table = 'respuestas_intento';

    protected $fillable = [
        'intento_id', 'pregunta_id', 'opcion_id',
        'texto_respuesta', 'respuesta_extra', 'es_correcta', 'puntaje_obtenido',
    ];

    protected function casts(): array
    {
        return [
            'es_correcta'      => 'boolean',
            'puntaje_obtenido' => 'decimal:2',
            'respuesta_extra'  => 'array',
        ];
    }

    public function intento(): BelongsTo
    {
        return $this->belongsTo(IntentoExamen::class, 'intento_id');
    }

    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class);
    }

    public function opcion(): BelongsTo
    {
        return $this->belongsTo(OpcionRespuesta::class, 'opcion_id');
    }
}
