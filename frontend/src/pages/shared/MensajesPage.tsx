import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mensajeriaService } from '@/services/mensajeriaService'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { Button, Avatar, Input, EmptyState } from '@/components/ui'
import type { Conversacion, Mensaje, User } from '@/types'

function otroParticipante(conv: Conversacion, userId?: number) {
  return conv.participantes?.find((p) => p.id !== userId)
}

// ─── Lista de conversaciones ──────────────────────────────────────────────────
function ConvList({
  convs, selected, onSelect, userId,
}: {
  convs: Conversacion[]; selected?: number; onSelect: (id: number) => void; userId?: number
}) {
  return (
    <div className="flex flex-col overflow-y-auto">
      {convs.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-8 px-4">Sin conversaciones aún.</p>
      )}
      {convs.map((c) => {
        const otro = otroParticipante(c, userId)
        const ultimo = c.ultimo_mensaje?.[0]
        return (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 ${selected === c.id ? 'bg-primary-50' : 'hover:bg-slate-50'}`}>
            <Avatar src={otro?.avatar} name={otro?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{otro?.name ?? 'Sin nombre'}</p>
              {ultimo && (
                <p className="text-xs text-slate-400 truncate">{ultimo.body}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Ventana de chat ──────────────────────────────────────────────────────────
function ChatWindow({ convId, userId }: { convId: number; userId?: number }) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: res } = useQuery({
    queryKey: ['mensajes', convId],
    queryFn: () => mensajeriaService.getMensajes(convId).then((r) => r.data.data),
    refetchInterval: 10_000,
  })
  const mensajes: Mensaje[] = res ?? []

  const sendMutation = useMutation({
    mutationFn: () => mensajeriaService.enviarMensaje(convId, text.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mensajes', convId] })
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
      setText('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim()) sendMutation.mutate()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {mensajes.map((m) => {
          const esMio = m.sender_id === userId
          return (
            <div key={m.id} className={`flex items-end gap-2 ${esMio ? 'flex-row-reverse' : ''}`}>
              {!esMio && <Avatar src={m.sender?.avatar} name={m.sender?.name ?? '?'} size="xs" />}
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${esMio
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md'}`}>
                {m.body}
                <p className={`text-[10px] mt-1 ${esMio ? 'text-primary-200' : 'text-slate-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribí un mensaje..."
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button onClick={() => sendMutation.mutate()} loading={sendMutation.isPending}
          disabled={!text.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  )
}

// ─── Modal: nueva conversación ────────────────────────────────────────────────
function NuevaConvModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState('')

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-lista'],
    queryFn: () => authService.getUsuarios().then((r) => r.data),
  })

  const crearMutation = useMutation({
    mutationFn: (participante_id: number) => mensajeriaService.crearConversacion(participante_id),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['conversaciones'] })
      onCreated(r.data.id)
    },
  })

  const filtrados = usuarios.filter((u) =>
    u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="p-4 border-b border-slate-100">
          <p className="font-semibold text-slate-900 mb-3">Nueva conversación</p>
          <Input placeholder="Buscar por nombre o email..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtrados.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Sin resultados.</p>
          )}
          {filtrados.map((u) => (
            <button key={u.id} onClick={() => crearMutation.mutate(u.id)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-50">
              <Avatar src={u.avatar} name={u.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-400 capitalize">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} className="w-full">Cancelar</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MensajesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [nuevaConvModal, setNuevaConvModal] = useState(false)

  const { data: conversaciones = [] } = useQuery({
    queryKey: ['conversaciones'],
    queryFn: () => mensajeriaService.getConversaciones().then((r) => r.data),
    refetchInterval: 30_000,
  })

  const selectedId = id ? Number(id) : conversaciones[0]?.id

  const handleSelect = (convId: number) => {
    navigate(`/mensajes/${convId}`)
  }

  return (
    <div className="-m-5 h-[calc(100vh-3.5rem)] flex overflow-hidden bg-slate-50">
      {/* Sidebar de conversaciones */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-900">Mensajes</p>
          <Button size="sm" variant="secondary" onClick={() => setNuevaConvModal(true)}>+ Nuevo</Button>
        </div>
        <ConvList convs={conversaciones} selected={selectedId} onSelect={handleSelect} userId={user?.id} />
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedId ? (
          <>
            {/* Header del chat */}
            <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
              {(() => {
                const conv = conversaciones.find((c) => c.id === selectedId)
                const otro = conv ? otroParticipante(conv, user?.id) : null
                return otro ? (
                  <>
                    <Avatar src={otro.avatar} name={otro.name} size="sm" />
                    <p className="font-semibold text-slate-900">{otro.name}</p>
                  </>
                ) : null
              })()}
            </div>
            <ChatWindow convId={selectedId} userId={user?.id} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon="💬" title="Seleccioná una conversación"
              description="O iniciá una nueva con el botón de arriba." />
          </div>
        )}
      </div>

      {nuevaConvModal && (
        <NuevaConvModal
          onClose={() => setNuevaConvModal(false)}
          onCreated={(id) => { setNuevaConvModal(false); navigate(`/mensajes/${id}`) }}
        />
      )}
    </div>
  )
}
