<?php

use App\Http\Controllers\Admin\AdminCarreraController;
use App\Http\Controllers\Admin\AdminMateriaController;
use App\Http\Controllers\Admin\AdminUsuarioController;
use App\Http\Controllers\Admin\AdminPeriodoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\ConversacionController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\InstitutoController;
use App\Http\Controllers\Materia\AnuncioController;
use App\Http\Controllers\Materia\EntregaController;
use App\Http\Controllers\Materia\ExamenController;
use App\Http\Controllers\Materia\IntentoController;
use App\Http\Controllers\Materia\NotaController;
use App\Http\Controllers\Materia\PlanCursoController;
use App\Http\Controllers\Materia\PreguntaController;
use App\Http\Controllers\Materia\RecursoController;
use App\Http\Controllers\Materia\TareaController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\NoticiaInstitutoController;
use App\Http\Controllers\NotificacionController;
use Illuminate\Support\Facades\Route;

// ─── Auth pública ────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ─── Rutas autenticadas ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::get('/usuarios', [AuthController::class, 'listarUsuarios']);

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        // Usuarios
        Route::apiResource('usuarios', AdminUsuarioController::class);
        Route::patch('usuarios/{usuario}/toggle-active', [AdminUsuarioController::class, 'toggleActive']);

        // Carreras
        Route::apiResource('carreras', AdminCarreraController::class);

        // Períodos lectivos
        Route::apiResource('periodos', AdminPeriodoController::class);

        // Materias
        Route::apiResource('materias', AdminMateriaController::class);
        Route::post('materias/{materia}/asignar-docente', [AdminMateriaController::class, 'asignarDocente']);
        Route::post('materias/{materia}/inscribir', [AdminMateriaController::class, 'inscribirEstudiantes']);
        Route::delete('materias/{materia}/desinscribir/{estudiante}', [AdminMateriaController::class, 'desinscribirEstudiante']);

    });

    // ── Instituto (admin+editor gestionan, todos leen) ────────────────────────
    Route::get('/instituto', [InstitutoController::class, 'show']);
    Route::put('/instituto', [InstitutoController::class, 'update']);

    Route::get('/noticias', [NoticiaInstitutoController::class, 'index']);
    Route::get('/noticias/{noticia}', [NoticiaInstitutoController::class, 'show']);
    Route::middleware('role:admin,editor')->group(function () {
        Route::post('/noticias', [NoticiaInstitutoController::class, 'store']);
        Route::put('/noticias/{noticia}', [NoticiaInstitutoController::class, 'update']);
        Route::delete('/noticias/{noticia}', [NoticiaInstitutoController::class, 'destroy']);
    });

    Route::get('/calendario', [CalendarioController::class, 'index']);
    Route::middleware('role:admin,editor')->group(function () {
        Route::post('/calendario', [CalendarioController::class, 'store']);
        Route::put('/calendario/{evento}', [CalendarioController::class, 'update']);
        Route::delete('/calendario/{evento}', [CalendarioController::class, 'destroy']);
    });

    Route::get('/documentos', [DocumentoController::class, 'index']);
    Route::get('/documentos/{documento}/descargar', [DocumentoController::class, 'descargar']);
    Route::middleware('role:admin,editor')->group(function () {
        Route::post('/documentos', [DocumentoController::class, 'store']);
        Route::delete('/documentos/{documento}', [DocumentoController::class, 'destroy']);
    });

    // ── Materias del usuario ──────────────────────────────────────────────────
    Route::get('/materias', [MateriaController::class, 'index']);
    Route::get('/materias/{materia}', [MateriaController::class, 'show']);

    // ── Contenido del Aula (anidado bajo /materias/:materia) ──────────────────
    Route::prefix('materias/{materia}')->group(function () {

        // Anuncios
        Route::get('/anuncios', [AnuncioController::class, 'index']);
        Route::post('/anuncios', [AnuncioController::class, 'store']);
        Route::put('/anuncios/{anuncio}', [AnuncioController::class, 'update']);
        Route::delete('/anuncios/{anuncio}', [AnuncioController::class, 'destroy']);

        // Recursos
        Route::get('/recursos', [RecursoController::class, 'index']);
        Route::post('/recursos', [RecursoController::class, 'store']);
        Route::delete('/recursos/{recurso}', [RecursoController::class, 'destroy']);
        Route::get('/recursos/{recurso}/descargar', [RecursoController::class, 'descargar']);

        // Plan de Curso
        Route::get('/plan-de-curso', [PlanCursoController::class, 'show']);
        Route::put('/plan-de-curso', [PlanCursoController::class, 'update']);

        // Tareas
        Route::get('/tareas', [TareaController::class, 'index']);
        Route::post('/tareas', [TareaController::class, 'store']);
        Route::get('/tareas/{tarea}', [TareaController::class, 'show']);
        Route::put('/tareas/{tarea}', [TareaController::class, 'update']);
        Route::delete('/tareas/{tarea}', [TareaController::class, 'destroy']);

        // Entregas (anidadas bajo tarea)
        Route::prefix('tareas/{tarea}/entregas')->group(function () {
            Route::get('/', [EntregaController::class, 'index']);
            Route::post('/', [EntregaController::class, 'store']);
            Route::post('/{entrega}/calificar', [EntregaController::class, 'calificar']);
        });

        // Exámenes
        Route::get('/examenes', [ExamenController::class, 'index']);
        Route::post('/examenes', [ExamenController::class, 'store']);
        Route::get('/examenes/{examen}', [ExamenController::class, 'show']);
        Route::put('/examenes/{examen}', [ExamenController::class, 'update']);
        Route::delete('/examenes/{examen}', [ExamenController::class, 'destroy']);

        // Preguntas (anidadas bajo examen)
        Route::prefix('examenes/{examen}')->group(function () {
            Route::post('/preguntas', [PreguntaController::class, 'store']);
            Route::put('/preguntas/{pregunta}', [PreguntaController::class, 'update']);
            Route::delete('/preguntas/{pregunta}', [PreguntaController::class, 'destroy']);
            Route::post('/preguntas/reordenar', [PreguntaController::class, 'reordenar']);

            // Intentos
            Route::post('/intentos', [IntentoController::class, 'iniciar']);
            Route::get('/intentos', [IntentoController::class, 'listarParaDocente']);
            Route::get('/intentos/{intento}', [IntentoController::class, 'show']);
            Route::post('/intentos/{intento}/responder', [IntentoController::class, 'responder']);
            Route::post('/intentos/{intento}/submit', [IntentoController::class, 'submit']);
            Route::post('/intentos/{intento}/calificar-desarrollo', [IntentoController::class, 'calificarDesarrollo']);
        });

        // Notas / Libro de calificaciones
        Route::get('/notas', [NotaController::class, 'index']);
        Route::post('/notas', [NotaController::class, 'store']);
        Route::put('/notas/{nota}', [NotaController::class, 'update']);
        Route::delete('/notas/{nota}', [NotaController::class, 'destroy']);

    });

    // ── Mensajería ────────────────────────────────────────────────────────────
    Route::get('/conversaciones', [ConversacionController::class, 'index']);
    Route::get('/conversaciones/no-leidos', [ConversacionController::class, 'noLeidos']);
    Route::post('/conversaciones', [ConversacionController::class, 'store']);
    Route::get('/conversaciones/{conversacion}/mensajes', [ConversacionController::class, 'mensajes']);
    Route::post('/conversaciones/{conversacion}/mensajes', [ConversacionController::class, 'enviarMensaje']);

    // ── Notificaciones ────────────────────────────────────────────────────────
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::patch('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarLeida']);
    Route::patch('/notificaciones/leer-todas', [NotificacionController::class, 'marcarTodasLeidas']);

});
