<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecursoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type'        => ['required', Rule::in(['archivo', 'link', 'video'])],
            'file'        => ['required_if:type,archivo', 'nullable', 'file', 'max:51200'], // 50MB
            'url'         => ['required_if:type,link,video', 'nullable', 'url'],
            'unidad'      => ['nullable', 'string', 'max:100'],
            'orden'       => ['integer', 'min:0'],
        ];
    }
}
