<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarioAcademico extends Model
{
    protected $table = 'calendario_academico';

    protected $fillable = ['title', 'description', 'date_start', 'date_end', 'color'];

    protected function casts(): array
    {
        return [
            'date_start' => 'date',
            'date_end'   => 'date',
        ];
    }
}
