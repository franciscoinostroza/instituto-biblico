<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recurso extends Model
{
    protected $fillable = [
        'materia_id', 'title', 'description', 'type', 'file_path', 'url', 'unidad', 'orden',
    ];

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }
}
