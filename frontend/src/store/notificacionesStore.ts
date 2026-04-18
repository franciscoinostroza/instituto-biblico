import { create } from 'zustand'
import type { Notificacion } from '@/types'

interface NotificacionesState {
  notificaciones: Notificacion[]
  noLeidas: number
  setNotificaciones: (notificaciones: Notificacion[], noLeidas: number) => void
  agregar: (notificacion: Notificacion) => void
  marcarLeida: (id: number) => void
  marcarTodasLeidas: () => void
}

export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  notificaciones: [],
  noLeidas: 0,

  setNotificaciones: (notificaciones, noLeidas) =>
    set({ notificaciones, noLeidas }),

  agregar: (notificacion) =>
    set((state) => ({
      notificaciones: [notificacion, ...state.notificaciones],
      noLeidas: state.noLeidas + 1,
    })),

  marcarLeida: (id) =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) =>
        n.id === id ? { ...n, leida_at: new Date().toISOString() } : n
      ),
      noLeidas: Math.max(0, state.noLeidas - 1),
    })),

  marcarTodasLeidas: () =>
    set((state) => ({
      notificaciones: state.notificaciones.map((n) => ({
        ...n,
        leida_at: n.leida_at ?? new Date().toISOString(),
      })),
      noLeidas: 0,
    })),
}))
