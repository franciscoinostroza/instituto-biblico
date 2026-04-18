<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users')->ignore($this->route('usuario'))],
            'password' => ['sometimes', Password::min(8)],
            'role'     => ['sometimes', Rule::in(['admin', 'docente', 'estudiante'])],
            'phone'    => ['nullable', 'string', 'max:30'],
            'active'   => ['boolean'],
        ];
    }
}
