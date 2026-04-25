<?php

namespace App\Http\Requests\Instituto;

use Illuminate\Foundation\Http\FormRequest;

class StoreCalendarioRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->canEditInstituto(); }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date_start'  => ['required', 'date'],
            'date_end'    => ['required', 'date', 'after_or_equal:date_start'],
            'color'       => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }
}
