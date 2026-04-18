<?php

namespace App\Policies;

use App\Models\Entrega;
use App\Models\Tarea;
use App\Models\User;

class EntregaPolicy
{
    public function view(User $user, Entrega $entrega): bool
    {
        if ($user->isAdmin()) return true;

        // Estudiante: solo su propia entrega
        if ($user->isEstudiante()) {
            return $entrega->estudiante_id === $user->id;
        }

        // Docente: cualquier entrega de su materia
        if ($user->isDocente()) {
            return $entrega->tarea->materia->docente_id === $user->id;
        }

        return false;
    }

    public function create(User $user, Tarea $tarea): bool
    {
        if (!$user->isEstudiante()) return false;

        return $tarea->materia->inscripciones()
            ->where('estudiante_id', $user->id)
            ->where('active', true)
            ->exists();
    }

    public function calificar(User $user, Entrega $entrega): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente()
            && $entrega->tarea->materia->docente_id === $user->id;
    }

    public function viewAnyForMateria(User $user, \App\Models\Materia $materia): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente() && $materia->docente_id === $user->id;
    }
}
