<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entrega extends Model
{
    protected $fillable = [
        'tarea_id', 'estudiante_id', 'file_path', 'comentario_alumno',
        'nota', 'comentario_docente', 'calificado_at',
    ];

    protected function casts(): array
    {
        return [
            'calificado_at' => 'datetime',
            'nota'          => 'decimal:2',
        ];
    }

    public function tarea(): BelongsTo
    {
        return $this->belongsTo(Tarea::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }
}
