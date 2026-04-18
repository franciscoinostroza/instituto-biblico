<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PeriodoLectivo extends Model
{
    protected $table = 'periodos_lectivos';

    protected $fillable = ['name', 'year', 'semester', 'date_start', 'date_end', 'active'];

    protected function casts(): array
    {
        return [
            'date_start' => 'date',
            'date_end'   => 'date',
            'active'     => 'boolean',
        ];
    }

    public function materias(): HasMany
    {
        return $this->hasMany(Materia::class, 'periodo_id');
    }
}
