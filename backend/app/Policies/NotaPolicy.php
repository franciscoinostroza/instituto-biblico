<?php

namespace App\Policies;

use App\Models\Materia;
use App\Models\Nota;
use App\Models\User;

class NotaPolicy
{
    public function view(User $user, Nota $nota): bool
    {
        if ($user->isAdmin()) return true;

        // Estudiante: solo sus propias notas
        if ($user->isEstudiante()) {
            return $nota->estudiante_id === $user->id;
        }

        // Docente: notas de su materia
        if ($user->isDocente()) {
            return $nota->materia->docente_id === $user->id;
        }

        return false;
    }

    public function viewLibro(User $user, Materia $materia): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente() && $materia->docente_id === $user->id;
    }

    public function create(User $user, Materia $materia): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente() && $materia->docente_id === $user->id;
    }

    public function update(User $user, Nota $nota): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente()
            && $nota->materia->docente_id === $user->id;
    }

    public function delete(User $user, Nota $nota): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente()
            && $nota->materia->docente_id === $user->id;
    }
}
