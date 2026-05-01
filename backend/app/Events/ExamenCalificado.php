<?php

namespace App\Events;

use App\Models\IntentoExamen;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamenCalificado
{
    use Dispatchable, SerializesModels;

    public function __construct(public IntentoExamen $intento) {}
}
