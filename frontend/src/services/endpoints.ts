import { api } from "./api";
import type { User } from "@/types";

// ===== AUTH =====
export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const { data } = await api.post("/login", { email, password });
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get("/me");
    return data;
  },
  logout: async (): Promise<void> => {
    await api.post("/logout");
  },
};

// ===== PERFIL =====
export const perfilService = {
  updateDatos: async (data: { name: string; phone: string }) => {
    const { data: res } = await api.put("/me", data);
    return res;
  },
  updatePassword: async (data: { current_password: string; password: string; password_confirmation: string }) => {
    const { data: res } = await api.put("/me", data);
    return res;
  },
};

// ===== MATERIAS =====
export const materiasService = {
  listMine: async () => {
    const { data } = await api.get("/materias");
    return data;
  },
  get: async (id: number) => {
    const { data } = await api.get(`/materias/${id}`);
    return data;
  },
};

// ===== ADMIN =====
export const adminService = {
  // Usuarios
  usuarios: async () => {
    const { data } = await api.get("/admin/usuarios");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  usuariosPorRol: async (role: string) => {
    const { data } = await api.get("/admin/usuarios", { params: { role } });
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  crearUsuario: async (data: object) => {
    const { data: res } = await api.post("/admin/usuarios", data);
    return res;
  },
  actualizarUsuario: async (id: number, data: object) => {
    const { data: res } = await api.put(`/admin/usuarios/${id}`, data);
    return res;
  },
  eliminarUsuario: async (id: number) => {
    await api.delete(`/admin/usuarios/${id}`);
  },
  toggleActiveUsuario: async (id: number) => {
    const { data } = await api.patch(`/admin/usuarios/${id}/toggle-active`);
    return data;
  },

  // Carreras
  carreras: async () => {
    const { data } = await api.get("/admin/carreras");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  crearCarrera: async (data: object) => {
    const { data: res } = await api.post("/admin/carreras", data);
    return res;
  },
  actualizarCarrera: async (id: number, data: object) => {
    const { data: res } = await api.put(`/admin/carreras/${id}`, data);
    return res;
  },
  eliminarCarrera: async (id: number) => {
    await api.delete(`/admin/carreras/${id}`);
  },

  // Materias
  materiasAdmin: async () => {
    const { data } = await api.get("/admin/materias");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  crearMateria: async (data: object) => {
    const { data: res } = await api.post("/admin/materias", data);
    return res;
  },
  actualizarMateria: async (id: number, data: object) => {
    const { data: res } = await api.put(`/admin/materias/${id}`, data);
    return res;
  },
  eliminarMateria: async (id: number) => {
    await api.delete(`/admin/materias/${id}`);
  },
  asignarDocente: async (materiaId: number, docenteId: number) => {
    const { data } = await api.post(`/admin/materias/${materiaId}/asignar-docente`, { docente_id: docenteId });
    return data;
  },

  // Períodos
  periodos: async () => {
    const { data } = await api.get("/admin/periodos");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  crearPeriodo: async (data: object) => {
    const { data: res } = await api.post("/admin/periodos", data);
    return res;
  },
};

// ===== AULA =====
export const aulaService = {
  anuncios: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/anuncios`);
    return data;
  },
  recursos: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/recursos`);
    return data;
  },
  planCurso: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/plan-de-curso`);
    return data;
  },
  tareas: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/tareas`);
    return data;
  },
  examenes: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/examenes`);
    return data;
  },
  notas: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/notas`);
    return data;
  },
  crearAnuncio: async (materiaId: number, data: { title: string; body: string }) => {
    const { data: res } = await api.post(`/materias/${materiaId}/anuncios`, data);
    return res;
  },
  crearRecurso: async (materiaId: number, formData: FormData) => {
    const { data: res } = await api.post(`/materias/${materiaId}/recursos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },
  descargarRecurso: (materiaId: number, recursoId: number) =>
    `${(import.meta.env.VITE_API_URL as string | undefined) ?? "/api"}/materias/${materiaId}/recursos/${recursoId}/descargar`,
  crearTarea: async (materiaId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/tareas`, data);
    return res;
  },
  entregarTarea: async (materiaId: number, tareaId: number, formData: FormData) => {
    const { data: res } = await api.post(`/materias/${materiaId}/tareas/${tareaId}/entregas`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  },
  crearExamen: async (materiaId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/examenes`, data);
    return res;
  },
  getExamen: async (materiaId: number, examenId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/examenes/${examenId}`);
    return data;
  },
  updateExamen: async (materiaId: number, examenId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/examenes/${examenId}`, data);
    return res;
  },
  deleteExamen: async (materiaId: number, examenId: number) => {
    await api.delete(`/materias/${materiaId}/examenes/${examenId}`);
  },
  crearPregunta: async (materiaId: number, examenId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/examenes/${examenId}/preguntas`, data);
    return res;
  },
  updatePregunta: async (materiaId: number, examenId: number, preguntaId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/examenes/${examenId}/preguntas/${preguntaId}`, data);
    return res;
  },
  deletePregunta: async (materiaId: number, examenId: number, preguntaId: number) => {
    await api.delete(`/materias/${materiaId}/examenes/${examenId}/preguntas/${preguntaId}`);
  },
  iniciarExamen: async (materiaId: number, examenId: number) => {
    const { data } = await api.post(`/materias/${materiaId}/examenes/${examenId}/intentos`);
    return data;
  },
  responderPregunta: async (materiaId: number, examenId: number, intentoId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/examenes/${examenId}/intentos/${intentoId}/responder`, data);
    return res;
  },
  submitExamen: async (materiaId: number, examenId: number, intentoId: number) => {
    const { data } = await api.post(`/materias/${materiaId}/examenes/${examenId}/intentos/${intentoId}/submit`);
    return data;
  },
  getIntento: async (materiaId: number, examenId: number, intentoId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/examenes/${examenId}/intentos/${intentoId}`);
    return data;
  },
  listarIntentos: async (materiaId: number, examenId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/examenes/${examenId}/intentos`);
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  calificarDesarrollo: async (materiaId: number, examenId: number, intentoId: number, nota: number) => {
    const { data } = await api.post(`/materias/${materiaId}/examenes/${examenId}/intentos/${intentoId}/calificar-desarrollo`, { nota_desarrollo: nota });
    return data;
  },
  updateTarea: async (materiaId: number, tareaId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/tareas/${tareaId}`, data);
    return res;
  },
  deleteTarea: async (materiaId: number, tareaId: number) => {
    await api.delete(`/materias/${materiaId}/tareas/${tareaId}`);
  },
  listarEntregas: async (materiaId: number, tareaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/tareas/${tareaId}/entregas`);
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  calificarEntrega: async (materiaId: number, tareaId: number, entregaId: number, data: { nota: number; comentario_docente?: string }) => {
    const { data: res } = await api.post(`/materias/${materiaId}/tareas/${tareaId}/entregas/${entregaId}/calificar`, data);
    return res;
  },
  crearNota: async (materiaId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/notas`, data);
    return res;
  },
  actualizarNota: async (materiaId: number, notaId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/notas/${notaId}`, data);
    return res;
  },
  eliminarNota: async (materiaId: number, notaId: number) => {
    await api.delete(`/materias/${materiaId}/notas/${notaId}`);
  },
  actualizarPlanCurso: async (materiaId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/plan-de-curso`, data);
    return res;
  },
  libroCalificaciones: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/libro-calificaciones`);
    return data;
  },
  asistencias: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/asistencias`);
    return data;
  },
  crearAsistencia: async (materiaId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/asistencias`, data);
    return res;
  },
  actualizarAsistencia: async (materiaId: number, asistenciaId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/asistencias/${asistenciaId}`, data);
    return res;
  },
  eliminarAsistencia: async (materiaId: number, asistenciaId: number) => {
    await api.delete(`/materias/${materiaId}/asistencias/${asistenciaId}`);
  },
  resumenAsistencia: async (materiaId: number) => {
    const { data } = await api.get(`/materias/${materiaId}/asistencias/resumen`);
    return data;
  },
};

// ===== NOTIFICACIONES =====
export const notificacionesService = {
  list: async () => {
    const { data } = await api.get("/notificaciones");
    return data;
  },
  marcarLeida: async (id: number) => {
    const { data } = await api.patch(`/notificaciones/${id}/leer`);
    return data;
  },
  marcarTodasLeidas: async () => {
    const { data } = await api.patch("/notificaciones/leer-todas");
    return data;
  },
};

// ===== MENSAJES =====
export const mensajesService = {
  conversaciones: async () => {
    const { data } = await api.get("/conversaciones");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  noLeidos: async (): Promise<number> => {
    const { data } = await api.get("/conversaciones/no-leidos");
    return data.count ?? 0;
  },
  mensajes: async (convId: number) => {
    const { data } = await api.get(`/conversaciones/${convId}/mensajes`);
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  crearConversacion: async (participanteId: number) => {
    const { data } = await api.post("/conversaciones", { participante_id: participanteId });
    return data;
  },
  enviarMensaje: async (convId: number, body: string) => {
    const { data } = await api.post(`/conversaciones/${convId}/mensajes`, { body });
    return data;
  },
};

// ===== INSTITUTO =====
export const institutoService = {
  getInstituto: async () => { const { data } = await api.get("/instituto"); return data; },
  updateInstituto: async (d: object) => { const { data } = await api.put("/instituto", d); return data; },

  getNoticias: async (periodo?: string) => {
    const { data } = await api.get("/noticias", { params: periodo ? { periodo } : {} });
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  crearNoticia: async (d: object) => { const { data } = await api.post("/noticias", d); return data; },
  updateNoticia: async (id: number, d: object) => { const { data } = await api.put(`/noticias/${id}`, d); return data; },
  deleteNoticia: async (id: number) => { await api.delete(`/noticias/${id}`); },

  getCalendario: async () => { const { data } = await api.get("/calendario"); return Array.isArray(data) ? data : []; },
  crearEvento: async (d: object) => { const { data } = await api.post("/calendario", d); return data; },
  updateEvento: async (id: number, d: object) => { const { data } = await api.put(`/calendario/${id}`, d); return data; },
  deleteEvento: async (id: number) => { await api.delete(`/calendario/${id}`); },

  getDocumentos: async () => { const { data } = await api.get("/documentos"); return Array.isArray(data) ? data : []; },
  crearDocumento: async (d: object) => { const { data } = await api.post("/documentos", d); return data; },
  deleteDocumento: async (id: number) => { await api.delete(`/documentos/${id}`); },
};

// ===== USUARIOS =====
export const usuariosService = {
  listar: async () => {
    const { data } = await api.get("/usuarios");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
};
