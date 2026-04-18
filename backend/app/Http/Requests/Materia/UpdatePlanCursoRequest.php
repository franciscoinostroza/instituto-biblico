<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanCursoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'content'      => ['nullable', 'string'],
            'objetivos'    => ['nullable', 'string'],
            'bibliografia' => ['nullable', 'string'],
        ];
    }
}
