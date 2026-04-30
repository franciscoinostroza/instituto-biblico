<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nota extends Model
{
    protected $fillable = [
        'materia_id', 'estudiante_id', 'tipo', 'referencia_id',
        'descripcion', 'nota', 'puntaje_maximo', 'fecha',
    ];

    protected function casts(): array
    {
        return ['nota' => 'decimal:2'];
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }
}
