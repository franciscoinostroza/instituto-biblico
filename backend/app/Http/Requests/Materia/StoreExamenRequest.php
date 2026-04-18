<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamenRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'                  => ['required', 'string', 'max:255'],
            'descripcion'            => ['nullable', 'string'],
            'tipo'                   => ['required', Rule::in(['examen', 'control_lectura'])],
            'fecha_apertura'         => ['nullable', 'date'],
            'fecha_cierre'           => ['nullable', 'date', 'after_or_equal:fecha_apertura'],
            'tiempo_limite_minutos'  => ['nullable', 'integer', 'min:1'],
            'intentos_permitidos'    => ['integer', 'min:1', 'max:10'],
        ];
    }
}
