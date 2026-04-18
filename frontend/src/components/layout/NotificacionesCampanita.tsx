import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import api from '@/services/api'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import type { Notificacion, PaginatedResponse } from '@/types'

export function NotificacionesCampanita() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { noLeidas, setNotificaciones, marcarLeida, marcarTodasLeidas } = useNotificacionesStore()

  const { data } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: () => api.get<{ notificaciones: PaginatedResponse<Notificacion>; no_leidas: number }>('/notificaciones'),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (data) {
      setNotificaciones(data.data.notificaciones.data, data.data.no_leidas)
    }
  }, [data, setNotificaciones])

  const marcarLeidaMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notificaciones/${id}/leer`),
    onSuccess: (_, id) => {
      marcarLeida(id)
      qc.invalidateQueries({ queryKey: ['notificaciones'] })
    },
  })

  const marcarTodasMutation = useMutation({
    mutationFn: () => api.patch('/notificaciones/leer-todas'),
    onSuccess: () => {
      marcarTodasLeidas()
      qc.invalidateQueries({ queryKey: ['notificaciones'] })
    },
  })

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const notificaciones = data?.data.notificaciones.data ?? []

  const handleClick = (n: Notificacion) => {
    if (!n.leida_at) marcarLeidaMutation.mutate(n.id)
    if (n.url_destino) navigate(n.url_destino)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
            {noLeidas > 0 && (
              <button
                onClick={() => marcarTodasMutation.mutate()}
                className="text-xs text-primary-600 hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notificaciones.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sin notificaciones</p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={clsx(
                    'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors',
                    !n.leida_at && 'bg-primary-50',
                  )}
                >
                  <p className={clsx('text-sm font-medium', !n.leida_at ? 'text-primary-800' : 'text-slate-700')}>
                    {n.titulo}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
