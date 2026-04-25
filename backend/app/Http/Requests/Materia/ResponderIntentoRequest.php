<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;

class ResponderIntentoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'pregunta_id'     => ['required', 'exists:preguntas,id'],
            'opcion_id'       => ['nullable', 'exists:opciones_respuesta,id'],
            'texto_respuesta' => ['nullable', 'string', 'max:10000'],
            'respuesta_extra' => ['nullable', 'array'],
        ];
    }
}
