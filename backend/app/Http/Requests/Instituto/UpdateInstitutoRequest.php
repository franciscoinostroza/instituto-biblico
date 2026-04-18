<?php

namespace App\Http\Requests\Instituto;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstitutoRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'string', 'max:255'],
            'logo'        => ['nullable', 'image', 'max:2048'],
            'description' => ['nullable', 'string'],
            'address'     => ['nullable', 'string', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email'],
            'website'     => ['nullable', 'url'],
        ];
    }
}
