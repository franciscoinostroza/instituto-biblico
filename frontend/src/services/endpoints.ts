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
    return data;
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
