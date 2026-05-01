<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Examen extends Model
{
    protected $table = 'examenes';

    protected $fillable = [
        'materia_id', 'title', 'descripcion', 'tipo',
        'fecha_apertura', 'fecha_cierre', 'tiempo_limite_minutos', 'intentos_permitidos', 'peso_porcentaje',
    ];

    protected function casts(): array
    {
        return [
            'fecha_apertura' => 'datetime',
            'fecha_cierre'   => 'datetime',
        ];
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function preguntas(): HasMany
    {
        return $this->hasMany(Pregunta::class)->orderBy('orden');
    }

    public function intentos(): HasMany
    {
        return $this->hasMany(IntentoExamen::class);
    }

    public function estaAbierto(): bool
    {
        $now = now();
        return ($this->fecha_apertura === null || $this->fecha_apertura <= $now)
            && ($this->fecha_cierre === null || $this->fecha_cierre >= $now);
    }
}
