// Tipos TypeScript del dominio del instituto
export type Rol = "admin" | "docente" | "estudiante";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Rol;
  avatar?: string;
  phone?: string;
  active: boolean;
}

export interface Carrera {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  totalMaterias?: number;
  totalEstudiantes?: number;
}

export interface PeriodoLectivo {
  id: number;
  name: string;
  year: number;
  semester: number;
  date_start: string;
  date_end: string;
  active: boolean;
}

export interface Materia {
  id: number;
  name: string;
  code: string;
  description?: string;
  carrera_id: number;
  carrera?: string;
  periodo_id: number;
  docente_id: number;
  docente?: User;
  active: boolean;
  // metadatos UI
  color?: string;
  cover?: string;
  totalEstudiantes?: number;
  progreso?: number; // 0-100, vista estudiante
  proximaEntrega?: string;
}

export interface Anuncio {
  id: number;
  materia_id: number;
  autor_id: number;
  autor?: User;
  title: string;
  body: string;
  published_at: string;
}

export interface Recurso {
  id: number;
  materia_id: number;
  title: string;
  description?: string;
  type: "archivo" | "link" | "video";
  file_path?: string;
  url?: string;
  unidad?: string;
  orden?: number;
}

export interface PlanCurso {
  id: number;
  materia_id: number;
  content: string;
  objetivos: string;
  bibliografia: string;
  updated_at: string;
}

export interface Tarea {
  id: number;
  materia_id: number;
  title: string;
  description: string;
  fecha_limite: string;
  puntaje_maximo: number;
  permite_entrega_tardia: boolean;
  // UI
  totalEntregas?: number;
  totalEsperadas?: number;
  miEntrega?: Entrega | null;
}

export interface Entrega {
  id: number;
  tarea_id: number;
  estudiante_id: number;
  estudiante?: User;
  file_path?: string;
  comentario_alumno?: string;
  nota?: number;
  comentario_docente?: string;
  calificado_at?: string;
  entregado_at: string;
}

export type TipoExamen = "examen" | "control_lectura";
export type EstadoIntento = "en_progreso" | "finalizado" | "calificado";

export interface Examen {
  id: number;
  materia_id: number;
  title: string;
  descripcion: string;
  tipo: TipoExamen;
  fecha_apertura: string;
  fecha_cierre: string;
  tiempo_limite_minutos: number;
  intentos_permitidos: number;
  totalPreguntas?: number;
  miIntento?: { estado: EstadoIntento; nota?: number } | null;
}

export type TipoNota = "tarea" | "examen" | "control_lectura" | "parcial" | "final" | "adicional";

export interface Nota {
  id: number;
  materia_id: number;
  estudiante_id: number;
  estudiante?: User;
  tipo: TipoNota;
  referencia_id?: number;
  descripcion: string;
  nota: number;
  puntaje_maximo: number;
  fecha: string;
}

export interface Notificacion {
  id: number;
  user_id: number;
  tipo: string;
  titulo: string;
  body: string;
  url_destino?: string;
  leida_at?: string | null;
  created_at: string;
}
