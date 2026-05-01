<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

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

    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) return null;
        try {
            return Storage::disk('s3')->temporaryUrl($this->file_path, now()->addMinutes(60));
        } catch (\Throwable $e) {
            return Storage::disk('s3')->url($this->file_path);
        }
    }

    protected $appends = ['file_url'];

    public function tarea(): BelongsTo
    {
        return $this->belongsTo(Tarea::class);
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }
}
