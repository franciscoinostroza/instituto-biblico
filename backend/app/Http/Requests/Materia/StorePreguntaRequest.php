<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePreguntaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'enunciado'              => ['required', 'string'],
            'tipo'                   => ['required', Rule::in([
                'opcion_multiple', 'multiple_correctas', 'verdadero_falso',
                'respuesta_corta', 'desarrollo', 'completar_espacios',
                'emparejar', 'ordenar',
                'multiple_choice', // backward compat
            ])],
            'orden'                  => ['integer', 'min:0'],
            'puntaje'                => ['numeric', 'min:0'],
            'datos_extra'            => ['nullable', 'array'],
            'opciones'               => ['nullable', 'array'],
            'opciones.*.texto'       => ['required_with:opciones', 'string'],
            'opciones.*.es_correcta' => ['required_with:opciones', 'boolean'],
        ];
    }
}
