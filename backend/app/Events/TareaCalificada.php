<?php

namespace App\Events;

use App\Models\Entrega;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TareaCalificada
{
    use Dispatchable, SerializesModels;

    public function __construct(public Entrega $entrega) {}
}
