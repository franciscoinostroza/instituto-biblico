<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;

class StoreEntregaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'file'               => ['nullable', 'file', 'max:51200'],
            'comentario_alumno'  => ['nullable', 'string', 'max:2000'],
        ];
    }
}
