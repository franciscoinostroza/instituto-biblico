<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpcionRespuesta extends Model
{
    protected $table = 'opciones_respuesta';

    protected $fillable = ['pregunta_id', 'texto', 'es_correcta'];

    protected function casts(): array
    {
        return ['es_correcta' => 'boolean'];
    }

    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class);
    }
}
