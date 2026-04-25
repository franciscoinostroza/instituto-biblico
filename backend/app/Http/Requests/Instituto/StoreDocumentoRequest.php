<?php

namespace App\Http\Requests\Instituto;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentoRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->canEditInstituto(); }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'file'        => ['nullable', 'file', 'max:51200'],
            'url'         => ['nullable', 'url', 'max:500'],
            'category'    => ['nullable', 'string', 'max:100'],
        ];
        // al menos url o file debe estar presente — se valida en el controlador
    }
}
