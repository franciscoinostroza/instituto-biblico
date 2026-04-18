import api from './api'
import type { Conversacion, Mensaje } from '@/types'

export const mensajeriaService = {
  getConversaciones: () => api.get<Conversacion[]>('/conversaciones'),
  crearConversacion: (participante_id: number) => api.post<Conversacion>('/conversaciones', { participante_id }),
  getMensajes: (conversacionId: number) => api.get<{ data: Mensaje[] }>(`/conversaciones/${conversacionId}/mensajes`),
  enviarMensaje: (conversacionId: number, body: string) =>
    api.post<Mensaje>(`/conversaciones/${conversacionId}/mensajes`, { body }),
}
