<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversacionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'participante_id' => ['required', 'exists:users,id', 'different:' . $this->user()->id],
        ];
    }
}
