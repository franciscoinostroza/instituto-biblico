<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMateriaRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'string', 'max:255'],
            'code'        => ['sometimes', 'string', 'max:20', Rule::unique('materias')->ignore($this->route('materia'))],
            'description' => ['nullable', 'string'],
            'carrera_id'  => ['sometimes', 'exists:carreras,id'],
            'periodo_id'  => ['sometimes', 'exists:periodos_lectivos,id'],
            'docente_id'  => ['nullable', 'exists:users,id'],
            'active'      => ['boolean'],
        ];
    }
}
