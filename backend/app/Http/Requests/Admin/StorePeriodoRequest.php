<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePeriodoRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'year'       => ['required', 'integer', 'min:2000', 'max:2100'],
            'semester'   => ['required', 'integer', 'in:1,2'],
            'date_start' => ['required', 'date'],
            'date_end'   => ['required', 'date', 'after:date_start'],
            'active'     => ['boolean'],
        ];
    }
}
