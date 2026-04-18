import api from './api'
import type { User, Carrera, Materia } from '@/types'

export const adminService = {
  // Usuarios
  getUsuarios: (params?: object) => api.get<{ data: User[] }>('/admin/usuarios', { params }),
  getUsuario: (id: number) => api.get<User>(`/admin/usuarios/${id}`),
  createUsuario: (data: Partial<User> & { password: string }) => api.post<User>('/admin/usuarios', data),
  updateUsuario: (id: number, data: Partial<User>) => api.put<User>(`/admin/usuarios/${id}`, data),
  deleteUsuario: (id: number) => api.delete(`/admin/usuarios/${id}`),
  toggleActive: (id: number) => api.patch(`/admin/usuarios/${id}/toggle-active`),

  // Carreras
  getCarreras: () => api.get<Carrera[]>('/admin/carreras'),
  createCarrera: (data: Partial<Carrera>) => api.post<Carrera>('/admin/carreras', data),
  updateCarrera: (id: number, data: Partial<Carrera>) => api.put<Carrera>(`/admin/carreras/${id}`, data),
  deleteCarrera: (id: number) => api.delete(`/admin/carreras/${id}`),

  // Materias admin
  getMaterias: (params?: object) => api.get<{ data: Materia[] }>('/admin/materias', { params }),
  createMateria: (data: Partial<Materia>) => api.post<Materia>('/admin/materias', data),
  updateMateria: (id: number, data: Partial<Materia>) => api.put<Materia>(`/admin/materias/${id}`, data),
  deleteMateria: (id: number) => api.delete(`/admin/materias/${id}`),
  asignarDocente: (materiaId: number, docente_id: number) =>
    api.post<Materia>(`/admin/materias/${materiaId}/asignar-docente`, { docente_id }),
  inscribirEstudiantes: (materiaId: number, estudiante_ids: number[]) =>
    api.post(`/admin/materias/${materiaId}/inscribir`, { estudiante_ids }),
  desinscribirEstudiante: (materiaId: number, estudianteId: number) =>
    api.delete(`/admin/materias/${materiaId}/desinscribir/${estudianteId}`),
}
