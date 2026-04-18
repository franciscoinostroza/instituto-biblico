<?php

namespace App\Http\Controllers\Materia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Materia\CalificarDesarrolloRequest;
use App\Http\Requests\Materia\ResponderIntentoRequest;
use App\Models\Examen;
use App\Models\IntentoExamen;
use App\Models\Materia;
use App\Models\RespuestaIntento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntentoController extends Controller
{
    public function iniciar(Request $request, Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('iniciar', [IntentoExamen::class, $examen]);

        // Si hay un intento en progreso, lo devuelve
        $enProgreso = $examen->intentos()
            ->where('estudiante_id', $request->user()->id)
            ->where('estado', 'en_progreso')
            ->first();

        if ($enProgreso) {
            return response()->json($enProgreso->load('respuestas'));
        }

        $intento = IntentoExamen::create([
            'examen_id'    => $examen->id,
            'estudiante_id' => $request->user()->id,
            'iniciado_at'  => now(),
            'estado'       => 'en_progreso',
        ]);

        return response()->json($intento, 201);
    }

    public function responder(ResponderIntentoRequest $request, Materia $materia, Examen $examen, IntentoExamen $intento): JsonResponse
    {
        $this->authorize('view', $intento);

        if ($intento->estado !== 'en_progreso') {
            return response()->json(['message' => 'Este intento ya fue finalizado.'], 422);
        }

        // Verificar tiempo límite
        if ($examen->tiempo_limite_minutos) {
            $minutosTranscurridos = $intento->iniciado_at->diffInMinutes(now());
            if ($minutosTranscurridos >= $examen->tiempo_limite_minutos) {
                $this->autocorregirYFinalizar($intento);
                return response()->json(['message' => 'Tiempo agotado. Intento finalizado automáticamente.'], 422);
            }
        }

        $respuesta = RespuestaIntento::updateOrCreate(
            ['intento_id' => $intento->id, 'pregunta_id' => $request->pregunta_id],
            [
                'opcion_id'       => $request->opcion_id,
                'texto_respuesta' => $request->texto_respuesta,
            ]
        );

        return response()->json($respuesta);
    }

    public function submit(Request $request, Materia $materia, Examen $examen, IntentoExamen $intento): JsonResponse
    {
        $this->authorize('view', $intento);

        if ($intento->estado !== 'en_progreso') {
            return response()->json(['message' => 'Este intento ya fue finalizado.'], 422);
        }

        $this->autocorregirYFinalizar($intento);

        return response()->json($intento->fresh()->load('respuestas.pregunta'));
    }

    public function show(Request $request, Materia $materia, Examen $examen, IntentoExamen $intento): JsonResponse
    {
        $this->authorize('view', $intento);

        return response()->json(
            $intento->load(['respuestas.pregunta', 'respuestas.opcion'])
        );
    }

    public function listarParaDocente(Request $request, Materia $materia, Examen $examen): JsonResponse
    {
        $this->authorize('gestionarContenido', $materia);

        $intentos = $examen->intentos()
            ->with('estudiante:id,name,email')
            ->orderByDesc('iniciado_at')
            ->get();

        return response()->json($intentos);
    }

    public function calificarDesarrollo(CalificarDesarrolloRequest $request, Materia $materia, Examen $examen, IntentoExamen $intento): JsonResponse
    {
        $this->authorize('calificarDesarrollo', $intento);

        $intento->update(['nota_desarrollo' => $request->nota_desarrollo]);

        // Calcular nota final
        $notaFinal = $this->calcularNotaFinal($intento->fresh());
        $intento->update([
            'nota_final' => $notaFinal,
            'estado'     => 'calificado',
        ]);

        return response()->json($intento->fresh());
    }

    private function autocorregirYFinalizar(IntentoExamen $intento): void
    {
        $puntajeAutomatico = 0;
        $tieneDesarrollo   = false;

        $respuestas = $intento->respuestas()->with('pregunta.opciones')->get();

        foreach ($respuestas as $respuesta) {
            $pregunta = $respuesta->pregunta;

            if (in_array($pregunta->tipo, ['multiple_choice', 'verdadero_falso'])) {
                if ($respuesta->opcion_id) {
                    $esCorrecta = $pregunta->opciones
                        ->where('id', $respuesta->opcion_id)
                        ->first()?->es_correcta ?? false;

                    $puntajeObtenido = $esCorrecta ? $pregunta->puntaje : 0;

                    $respuesta->update([
                        'es_correcta'     => $esCorrecta,
                        'puntaje_obtenido' => $puntajeObtenido,
                    ]);

                    $puntajeAutomatico += $puntajeObtenido;
                } else {
                    $respuesta->update(['es_correcta' => false, 'puntaje_obtenido' => 0]);
                }
            } elseif ($pregunta->tipo === 'desarrollo') {
                $tieneDesarrollo = true;
            }
        }

        $estado = $tieneDesarrollo ? 'finalizado' : 'calificado';
        $notaFinal = $tieneDesarrollo ? null : $puntajeAutomatico;

        $intento->update([
            'finalizado_at'   => now(),
            'nota_automatica' => $puntajeAutomatico,
            'nota_final'      => $notaFinal,
            'estado'          => $estado,
        ]);
    }

    private function calcularNotaFinal(IntentoExamen $intento): float
    {
        return ($intento->nota_automatica ?? 0) + ($intento->nota_desarrollo ?? 0);
    }
}
