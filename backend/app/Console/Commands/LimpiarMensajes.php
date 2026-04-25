<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class LimpiarMensajes extends Command
{
    protected $signature   = 'mensajes:limpiar';
    protected $description = 'Elimina todos los mensajes, participantes y conversaciones';

    public function handle(): void
    {
        DB::table('mensajes')->delete();
        DB::table('participantes_conversacion')->delete();
        DB::table('conversaciones')->delete();

        $this->info('Listo: mensajes, participantes y conversaciones eliminados.');
    }
}
