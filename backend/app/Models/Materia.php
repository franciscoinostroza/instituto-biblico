<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Materia extends Model
{
    protected $fillable = [
        'name', 'code', 'description', 'carrera_id', 'periodo_id', 'docente_id', 'active',
    ];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class);
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(PeriodoLectivo::class, 'periodo_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'inscripciones', 'materia_id', 'estudiante_id')
                    ->withPivot('fecha_inscripcion', 'active')
                    ->withTimestamps();
    }

    public function anuncios(): HasMany
    {
        return $this->hasMany(Anuncio::class);
    }

    public function recursos(): HasMany
    {
        return $this->hasMany(Recurso::class);
    }

    public function planDeCurso(): HasOne
    {
        return $this->hasOne(PlanDeCurso::class);
    }

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }

    public function examenes(): HasMany
    {
        return $this->hasMany(Examen::class);
    }

    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class);
    }
}
