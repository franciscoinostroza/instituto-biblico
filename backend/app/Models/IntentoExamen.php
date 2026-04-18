<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IntentoExamen extends Model
{
    protected $table = 'intentos_examen';

    protected $fillable = [
        'examen_id', 'estudiante_id', 'iniciado_at', 'finalizado_at',
        'nota_automatica', 'nota_desarrollo', 'nota_final', 'estado',
    ];

    protected function casts(): array
    {
        return [
            'iniciado_at'    => 'datetime',
            'finalizado_at'  => 'datetime',
            'nota_automatica' => 'decimal:2',
            'nota_desarrollo' => 'decimal:2',
            'nota_final'     => 'decimal:2',
        ];
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(RespuestaIntento::class, 'intento_id');
    }
}
