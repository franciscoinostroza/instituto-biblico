// ── Usuarios ──────────────────────────────────────────────────────────────────
export type Role = 'admin' | 'docente' | 'estudiante'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  avatar: string | null
  phone: string | null
  active: boolean
  created_at: string
}

// ── Instituto ─────────────────────────────────────────────────────────────────
export interface Instituto {
  id: number
  name: string
  logo: string | null
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
}

export interface NoticiaInstituto {
  id: number
  title: string
  body: string
  author_id: number
  author?: Pick<User, 'id' | 'name'>
  published_at: string | null
  created_at: string
}

export interface DocumentoInstituto {
  id: number
  title: string
  file_path: string
  category: string | null
  created_at: string
}

export interface CalendarioAcademico {
  id: number
  title: string
  description: string | null
  date_start: string
  date_end: string
  color: string
}

// ── Académico ─────────────────────────────────────────────────────────────────
export interface Carrera {
  id: number
  name: string
  description: string | null
  active: boolean
  materias_count?: number
}

export interface PeriodoLectivo {
  id: number
  name: string
  year: number
  semester: 1 | 2
  date_start: string
  date_end: string
  active: boolean
}

export interface Materia {
  id: number
  name: string
  code: string
  description: string | null
  carrera_id: number
  periodo_id: number
  docente_id: number | null
  active: boolean
  carrera?: Carrera
  periodo?: PeriodoLectivo
  docente?: Pick<User, 'id' | 'name' | 'avatar'>
  inscripciones_count?: number
}

export interface Inscripcion {
  id: number
  materia_id: number
  estudiante_id: number
  fecha_inscripcion: string
  active: boolean
}

// ── Aula ──────────────────────────────────────────────────────────────────────
export interface Anuncio {
  id: number
  materia_id: number
  autor_id: number
  autor?: Pick<User, 'id' | 'name' | 'avatar'>
  title: string
  body: string
  published_at: string | null
  created_at: string
}

export type TipoRecurso = 'archivo' | 'link' | 'video'

export interface Recurso {
  id: number
  materia_id: number
  title: string
  description: string | null
  type: TipoRecurso
  file_path: string | null
  url: string | null
  unidad: string | null
  orden: number
}

export interface PlanDeCurso {
  id: number
  materia_id: number
  content: string | null
  objetivos: string | null
  bibliografia: string | null
}

export interface Tarea {
  id: number
  materia_id: number
  title: string
  description: string | null
  fecha_limite: string | null
  puntaje_maximo: number
  permite_entrega_tardia: boolean
  mi_entrega?: Entrega
  entregas?: Entrega[]
  entregas_count?: number
  created_at: string
}

export interface Entrega {
  id: number
  tarea_id: number
  estudiante_id: number
  estudiante?: Pick<User, 'id' | 'name' | 'email' | 'avatar'>
  file_path: string | null
  comentario_alumno: string | null
  nota: number | null
  comentario_docente: string | null
  calificado_at: string | null
  created_at: string
}

// ── Exámenes ──────────────────────────────────────────────────────────────────
export type TipoExamen = 'examen' | 'control_lectura'
export type TipoPregunta = 'multiple_choice' | 'verdadero_falso' | 'desarrollo'
export type EstadoIntento = 'en_progreso' | 'finalizado' | 'calificado'

export interface OpcionRespuesta {
  id: number
  pregunta_id: number
  texto: string
  es_correcta?: boolean
}

export interface Pregunta {
  id: number
  examen_id: number
  enunciado: string
  tipo: TipoPregunta
  orden: number
  puntaje: number
  opciones?: OpcionRespuesta[]
}

export interface Examen {
  id: number
  materia_id: number
  title: string
  descripcion: string | null
  tipo: TipoExamen
  fecha_apertura: string | null
  fecha_cierre: string | null
  tiempo_limite_minutos: number | null
  intentos_permitidos: number
  preguntas?: Pregunta[]
  intentos_count?: number
  mis_intentos?: Pick<IntentoExamen, 'id' | 'estado' | 'nota_final' | 'iniciado_at' | 'finalizado_at'>[]
}

export interface RespuestaIntento {
  id: number
  intento_id: number
  pregunta_id: number
  opcion_id: number | null
  texto_respuesta: string | null
  es_correcta: boolean | null
  puntaje_obtenido: number | null
  pregunta?: Pregunta
  opcion?: OpcionRespuesta
}

export interface IntentoExamen {
  id: number
  examen_id: number
  estudiante_id: number
  estudiante?: Pick<User, 'id' | 'name' | 'email'>
  iniciado_at: string
  finalizado_at: string | null
  nota_automatica: number | null
  nota_desarrollo: number | null
  nota_final: number | null
  estado: EstadoIntento
  respuestas?: RespuestaIntento[]
}

// ── Notas ─────────────────────────────────────────────────────────────────────
export type TipoNota = 'tarea' | 'examen' | 'control_lectura' | 'parcial' | 'final' | 'adicional'

export interface Nota {
  id: number
  materia_id: number
  estudiante_id: number
  estudiante?: Pick<User, 'id' | 'name'>
  tipo: TipoNota
  referencia_id: number | null
  descripcion: string | null
  nota: number
  puntaje_maximo: number
  created_at: string
}

export interface FilaLibroCalificaciones {
  estudiante: Pick<User, 'id' | 'name' | 'email'>
  notas: Nota[]
  promedio: number | null
}

// ── Mensajería ────────────────────────────────────────────────────────────────
export interface Mensaje {
  id: number
  conversacion_id: number
  sender_id: number
  sender?: Pick<User, 'id' | 'name' | 'avatar'>
  body: string
  leido_at: string | null
  created_at: string
}

export interface Conversacion {
  id: number
  participantes?: Pick<User, 'id' | 'name' | 'avatar'>[]
  ultimo_mensaje?: Mensaje[]
  created_at: string
  updated_at: string
}

// ── Notificaciones ────────────────────────────────────────────────────────────
export interface Notificacion {
  id: number
  user_id: number
  tipo: string
  titulo: string
  body: string
  url_destino: string | null
  leida_at: string | null
  created_at: string
}

// ── Paginación ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
