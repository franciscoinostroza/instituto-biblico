<?php

namespace App\Http\Requests\Materia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePreguntaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'enunciado'             => ['required', 'string'],
            'tipo'                  => ['required', Rule::in(['multiple_choice', 'verdadero_falso', 'desarrollo'])],
            'orden'                 => ['integer', 'min:0'],
            'puntaje'               => ['numeric', 'min:0'],
            'opciones'              => ['required_unless:tipo,desarrollo', 'array', 'min:2'],
            'opciones.*.texto'      => ['required', 'string'],
            'opciones.*.es_correcta' => ['required', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $tipo    = $this->input('tipo');
            $opciones = $this->input('opciones', []);

            if (in_array($tipo, ['multiple_choice', 'verdadero_falso'])) {
                $correctas = collect($opciones)->where('es_correcta', true)->count();
                if ($correctas === 0) {
                    $v->errors()->add('opciones', 'Debe haber al menos una opción correcta.');
                }
            }
        });
    }
}
