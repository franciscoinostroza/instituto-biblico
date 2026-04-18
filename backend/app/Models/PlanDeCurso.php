<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanDeCurso extends Model
{
    protected $table = 'plan_de_curso';

    protected $fillable = ['materia_id', 'content', 'objetivos', 'bibliografia'];

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }
}
