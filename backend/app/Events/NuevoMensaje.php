<?php

namespace App\Events;

use App\Models\Conversacion;
use App\Models\Mensaje;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NuevoMensaje
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Mensaje $mensaje,
        public Conversacion $conversacion
    ) {}
}
