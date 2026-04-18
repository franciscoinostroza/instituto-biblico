<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarea extends Model
{
    protected $fillable = [
        'materia_id', 'title', 'description', 'fecha_limite',
        'puntaje_maximo', 'permite_entrega_tardia',
    ];

    protected function casts(): array
    {
        return [
            'fecha_limite'          => 'datetime',
            'permite_entrega_tardia' => 'boolean',
        ];
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(Entrega::class);
    }
}
