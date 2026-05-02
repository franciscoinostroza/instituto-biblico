<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;

class CalificarEntregaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $tarea = $this->route('tarea');
        return [
            'nota'               => ['required', 'numeric', 'min:0', 'max:' . ($tarea?->puntaje_maximo ?? 1000)],
            'comentario_docente' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
