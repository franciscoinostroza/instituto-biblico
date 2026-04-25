<?php

namespace App\Http\Requests\Instituto;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoticiaRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->canEditInstituto(); }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'body'         => ['required', 'string'],
            'published_at' => ['nullable', 'date'],
            'periodo'      => ['nullable', 'string', 'in:general,semanal,mensual,anual'],
        ];
    }
}
