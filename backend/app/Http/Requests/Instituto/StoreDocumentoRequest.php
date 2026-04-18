<?php

namespace App\Http\Requests\Instituto;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentoRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'title'    => ['required', 'string', 'max:255'],
            'file'     => ['required', 'file', 'max:51200'],
            'category' => ['nullable', 'string', 'max:100'],
        ];
    }
}
