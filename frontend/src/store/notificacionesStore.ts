import { create } from "zustand";
import type { Notificacion } from "@/types";

interface NotificacionesState {
  items: Notificacion[];
  setItems: (items: Notificacion[]) => void;
  agregar: (n: Notificacion) => void;
  marcarLeida: (id: number) => void;
  marcarTodasLeidas: () => void;
  noLeidas: () => number;
}

export const useNotificacionesStore = create<NotificacionesState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  agregar: (n) => set({ items: [n, ...get().items] }),
  marcarLeida: (id) =>
    set({ items: get().items.map((n) => (n.id === id ? { ...n, leida_at: new Date().toISOString() } : n)) }),
  marcarTodasLeidas: () =>
    set({ items: get().items.map((n) => ({ ...n, leida_at: n.leida_at ?? new Date().toISOString() })) }),
  noLeidas: () => get().items.filter((n) => !n.leida_at).length,
}));
