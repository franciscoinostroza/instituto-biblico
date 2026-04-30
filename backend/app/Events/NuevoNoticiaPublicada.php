<?php

namespace App\Events;

use App\Models\NoticiaInstituto;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NuevoNoticiaPublicada
{
    use Dispatchable, SerializesModels;

    public function __construct(public NoticiaInstituto $noticia) {}
}
