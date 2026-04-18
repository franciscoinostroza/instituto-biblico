<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMateriaRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'code'        => ['required', 'string', 'max:20', 'unique:materias,code'],
            'description' => ['nullable', 'string'],
            'carrera_id'  => ['required', 'exists:carreras,id'],
            'periodo_id'  => ['required', 'exists:periodos_lectivos,id'],
            'docente_id'  => ['nullable', 'exists:users,id'],
            'active'      => ['boolean'],
        ];
    }
}
