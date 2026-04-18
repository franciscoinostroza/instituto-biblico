<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;

class CalificarDesarrolloRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nota_desarrollo' => ['required', 'numeric', 'min:0'],
        ];
    }
}
