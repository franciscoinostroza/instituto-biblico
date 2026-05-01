<?php

namespace App\Providers;

use App\Events\ExamenDisponible;
use App\Events\NuevoAnuncioPublicado;
use App\Events\NuevoNoticiaPublicada;
use App\Events\TareaCalificada;
use App\Events\TareaEntregada;
use App\Listeners\NotificarDocenteTareaEntregada;
use App\Listeners\NotificarEstudiantesNuevoAnuncio;
use App\Listeners\NotificarExamenDisponible;
use App\Listeners\NotificarTareaCalificada;
use App\Listeners\NotificarUsuariosNuevaNoticia;
use App\Models\Entrega;
use App\Models\IntentoExamen;
use App\Models\Materia;
use App\Models\Nota;
use App\Policies\EntregaPolicy;
use App\Policies\IntentoPolicy;
use App\Policies\MateriaPolicy;
use App\Policies\NotaPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Policies
        Gate::policy(Materia::class, MateriaPolicy::class);
        Gate::policy(Entrega::class, EntregaPolicy::class);
        Gate::policy(IntentoExamen::class, IntentoPolicy::class);
        Gate::policy(Nota::class, NotaPolicy::class);

        // Events & Listeners
        Event::listen(NuevoAnuncioPublicado::class, NotificarEstudiantesNuevoAnuncio::class);
        Event::listen(NuevoNoticiaPublicada::class, NotificarUsuariosNuevaNoticia::class);
        Event::listen(TareaCalificada::class, NotificarTareaCalificada::class);
        Event::listen(TareaEntregada::class, NotificarDocenteTareaEntregada::class);
        Event::listen(ExamenDisponible::class, NotificarExamenDisponible::class);
    }
}
