<?php

namespace App\Events;

use App\Models\Examen;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamenDisponible
{
    use Dispatchable, SerializesModels;

    public function __construct(public Examen $examen) {}
}
