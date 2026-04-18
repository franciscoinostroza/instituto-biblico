import api from './api'
import type { Instituto, NoticiaInstituto, CalendarioAcademico, DocumentoInstituto } from '@/types'

export const institutoService = {
  getInstituto: () => api.get<Instituto>('/instituto'),
  updateInstituto: (data: FormData) => api.put<Instituto>('/instituto', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getNoticias: () => api.get<{ data: NoticiaInstituto[] }>('/noticias'),
  getNoticia: (id: number) => api.get<NoticiaInstituto>(`/noticias/${id}`),
  createNoticia: (data: Partial<NoticiaInstituto>) => api.post<NoticiaInstituto>('/noticias', data),
  updateNoticia: (id: number, data: Partial<NoticiaInstituto>) => api.put<NoticiaInstituto>(`/noticias/${id}`, data),
  deleteNoticia: (id: number) => api.delete(`/noticias/${id}`),

  getCalendario: (mes?: number, anio?: number) => api.get<CalendarioAcademico[]>('/calendario', { params: { mes, anio } }),
  createEvento: (data: Partial<CalendarioAcademico>) => api.post<CalendarioAcademico>('/calendario', data),
  updateEvento: (id: number, data: Partial<CalendarioAcademico>) => api.put<CalendarioAcademico>(`/calendario/${id}`, data),
  deleteEvento: (id: number) => api.delete(`/calendario/${id}`),

  getDocumentos: (category?: string) => api.get<DocumentoInstituto[]>('/documentos', { params: { category } }),
  uploadDocumento: (data: FormData) => api.post<DocumentoInstituto>('/documentos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocumento: (id: number) => api.delete(`/documentos/${id}`),
  descargarDocumento: (id: number) => api.get(`/documentos/${id}/descargar`),
}
