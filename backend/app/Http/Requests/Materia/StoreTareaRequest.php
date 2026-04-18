<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;

class StoreTareaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'                  => ['required', 'string', 'max:255'],
            'description'            => ['nullable', 'string'],
            'fecha_limite'           => ['nullable', 'date'],
            'puntaje_maximo'         => ['integer', 'min:1', 'max:1000'],
            'permite_entrega_tardia' => ['boolean'],
        ];
    }
}
