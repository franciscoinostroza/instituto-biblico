<?php

namespace App\Policies;

use App\Models\Examen;
use App\Models\IntentoExamen;
use App\Models\User;

class IntentoPolicy
{
    public function view(User $user, IntentoExamen $intento): bool
    {
        if ($user->isAdmin()) return true;

        // Estudiante: solo sus propios intentos
        if ($user->isEstudiante()) {
            return $intento->estudiante_id === $user->id;
        }

        // Docente: intentos de exámenes de su materia
        if ($user->isDocente()) {
            return $intento->examen->materia->docente_id === $user->id;
        }

        return false;
    }

    public function iniciar(User $user, Examen $examen): bool
    {
        if (!$user->isEstudiante()) return false;

        // Debe estar inscripto en la materia
        $inscripto = $examen->materia->inscripciones()
            ->where('estudiante_id', $user->id)
            ->where('active', true)
            ->exists();

        if (!$inscripto) return false;

        // El examen debe estar abierto
        if (!$examen->estaAbierto()) return false;

        // No debe haber superado los intentos permitidos
        $intentosUsados = $examen->intentos()
            ->where('estudiante_id', $user->id)
            ->whereIn('estado', ['finalizado', 'calificado'])
            ->count();

        return $intentosUsados < $examen->intentos_permitidos;
    }

    public function calificarDesarrollo(User $user, IntentoExamen $intento): bool
    {
        if ($user->isAdmin()) return true;
        return $user->isDocente()
            && $intento->examen->materia->docente_id === $user->id;
    }
}
