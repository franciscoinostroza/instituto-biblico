<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pregunta extends Model
{
    protected $fillable = ['examen_id', 'enunciado', 'tipo', 'orden', 'puntaje'];

    protected function casts(): array
    {
        return ['puntaje' => 'decimal:2'];
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class);
    }

    public function opciones(): HasMany
    {
        return $this->hasMany(OpcionRespuesta::class, 'pregunta_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(RespuestaIntento::class, 'pregunta_id');
    }
}
