<?php

namespace App\Policies;

use App\Models\Materia;
use App\Models\User;

class MateriaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Materia $materia): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->isDocente()) return $materia->docente_id === $user->id;
        // Estudiante: solo si está inscripto y activo
        return $materia->inscripciones()
            ->where('estudiante_id', $user->id)
            ->where('active', true)
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Materia $materia): bool
    {
        if ($user->isAdmin()) return true;
        // Docente puede editar contenido de su propia materia
        return $user->isDocente() && $materia->docente_id === $user->id;
    }

    public function delete(User $user, Materia $materia): bool
    {
        return $user->isAdmin();
    }

    public function gestionarContenido(User $user, Materia $materia): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente() && $materia->docente_id === $user->id;
    }
}
