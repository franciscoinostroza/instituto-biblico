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
  usuarios: async () => {
    const { data } = await api.get("/admin/usuarios");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
  usuariosPorRol: async (role: string) => {
    const { data } = await api.get("/admin/usuarios", { params: { role } });
    return data;
  },
  carreras: async () => {
    const { data } = await api.get("/admin/carreras");
    return data;
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
  crearNota: async (materiaId: number, data: object) => {
    const { data: res } = await api.post(`/materias/${materiaId}/notas`, data);
    return res;
  },
  actualizarPlanCurso: async (materiaId: number, data: object) => {
    const { data: res } = await api.put(`/materias/${materiaId}/plan-de-curso`, data);
    return res;
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

// ===== USUARIOS =====
export const usuariosService = {
  listar: async () => {
    const { data } = await api.get("/usuarios");
    return Array.isArray(data) ? data : (data.data ?? []);
  },
};
