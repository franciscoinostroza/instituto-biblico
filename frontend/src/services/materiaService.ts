import api from './api'
import type { Materia, Anuncio, Recurso, PlanDeCurso, Tarea, Entrega, Examen, Pregunta, IntentoExamen, Nota, FilaLibroCalificaciones } from '@/types'

export const materiaService = {
  getMaterias: () => api.get<Materia[]>('/materias'),
  getMateria: (id: number) => api.get<Materia>(`/materias/${id}`),

  // Anuncios
  getAnuncios: (materiaId: number) => api.get<Anuncio[]>(`/materias/${materiaId}/anuncios`),
  createAnuncio: (materiaId: number, data: Partial<Anuncio>) => api.post<Anuncio>(`/materias/${materiaId}/anuncios`, data),
  updateAnuncio: (materiaId: number, id: number, data: Partial<Anuncio>) => api.put<Anuncio>(`/materias/${materiaId}/anuncios/${id}`, data),
  deleteAnuncio: (materiaId: number, id: number) => api.delete(`/materias/${materiaId}/anuncios/${id}`),

  // Recursos
  getRecursos: (materiaId: number) => api.get<Recurso[]>(`/materias/${materiaId}/recursos`),
  createRecurso: (materiaId: number, data: FormData) => api.post<Recurso>(`/materias/${materiaId}/recursos`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteRecurso: (materiaId: number, id: number) => api.delete(`/materias/${materiaId}/recursos/${id}`),

  // Plan de curso
  getPlanDeCurso: (materiaId: number) => api.get<PlanDeCurso>(`/materias/${materiaId}/plan-de-curso`),
  updatePlanDeCurso: (materiaId: number, data: Partial<PlanDeCurso>) => api.put<PlanDeCurso>(`/materias/${materiaId}/plan-de-curso`, data),

  // Tareas
  getTareas: (materiaId: number) => api.get<Tarea[]>(`/materias/${materiaId}/tareas`),
  getTarea: (materiaId: number, id: number) => api.get<Tarea>(`/materias/${materiaId}/tareas/${id}`),
  createTarea: (materiaId: number, data: Partial<Tarea>) => api.post<Tarea>(`/materias/${materiaId}/tareas`, data),
  updateTarea: (materiaId: number, id: number, data: Partial<Tarea>) => api.put<Tarea>(`/materias/${materiaId}/tareas/${id}`, data),
  deleteTarea: (materiaId: number, id: number) => api.delete(`/materias/${materiaId}/tareas/${id}`),

  // Entregas
  getEntregas: (materiaId: number, tareaId: number) => api.get<Entrega[]>(`/materias/${materiaId}/tareas/${tareaId}/entregas`),
  submitEntrega: (materiaId: number, tareaId: number, data: FormData) => api.post<Entrega>(`/materias/${materiaId}/tareas/${tareaId}/entregas`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  calificarEntrega: (materiaId: number, tareaId: number, entregaId: number, data: { nota: number; comentario_docente?: string }) =>
    api.post<Entrega>(`/materias/${materiaId}/tareas/${tareaId}/entregas/${entregaId}/calificar`, data),

  // Exámenes
  getExamenes: (materiaId: number) => api.get<Examen[]>(`/materias/${materiaId}/examenes`),
  getExamen: (materiaId: number, id: number) => api.get<Examen>(`/materias/${materiaId}/examenes/${id}`),
  createExamen: (materiaId: number, data: Partial<Examen>) => api.post<Examen>(`/materias/${materiaId}/examenes`, data),
  updateExamen: (materiaId: number, id: number, data: Partial<Examen>) => api.put<Examen>(`/materias/${materiaId}/examenes/${id}`, data),
  deleteExamen: (materiaId: number, id: number) => api.delete(`/materias/${materiaId}/examenes/${id}`),

  // Intentos
  iniciarIntento: (materiaId: number, examenId: number) => api.post<IntentoExamen>(`/materias/${materiaId}/examenes/${examenId}/intentos`),
  responderIntento: (materiaId: number, examenId: number, intentoId: number, data: object) =>
    api.post(`/materias/${materiaId}/examenes/${examenId}/intentos/${intentoId}/responder`, data),
  submitIntento: (materiaId: number, examenId: number, intentoId: number) =>
    api.post<IntentoExamen>(`/materias/${materiaId}/examenes/${examenId}/intentos/${intentoId}/submit`),

  // Preguntas
  createPregunta: (materiaId: number, examenId: number, data: object) =>
    api.post<Pregunta>(`/materias/${materiaId}/examenes/${examenId}/preguntas`, data),
  updatePregunta: (materiaId: number, examenId: number, id: number, data: object) =>
    api.put<Pregunta>(`/materias/${materiaId}/examenes/${examenId}/preguntas/${id}`, data),
  deletePregunta: (materiaId: number, examenId: number, id: number) =>
    api.delete(`/materias/${materiaId}/examenes/${examenId}/preguntas/${id}`),

  // Intentos (docente)
  getIntentos: (materiaId: number, examenId: number) =>
    api.get<IntentoExamen[]>(`/materias/${materiaId}/examenes/${examenId}/intentos`),

  // Notas
  getNotas: (materiaId: number) => api.get<FilaLibroCalificaciones[] | Nota[]>(`/materias/${materiaId}/notas`),
  createNota: (materiaId: number, data: Partial<Nota>) => api.post<Nota>(`/materias/${materiaId}/notas`, data),
  updateNota: (materiaId: number, id: number, data: Partial<Nota>) => api.put<Nota>(`/materias/${materiaId}/notas/${id}`, data),
  deleteNota: (materiaId: number, id: number) => api.delete(`/materias/${materiaId}/notas/${id}`),
}
