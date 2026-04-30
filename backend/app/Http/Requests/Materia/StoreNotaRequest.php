<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNotaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'estudiante_id'  => ['required', 'exists:users,id'],
            'tipo'           => ['required', Rule::in(['tarea', 'examen', 'control_lectura', 'parcial', 'final', 'adicional'])],
            'referencia_id'  => ['nullable', 'integer'],
            'descripcion'    => ['nullable', 'string', 'max:255'],
            'nota'           => ['required', 'numeric', 'min:0'],
            'puntaje_maximo' => ['integer', 'min:1'],
            'fecha'          => ['nullable', 'date'],
        ];
    }
}
