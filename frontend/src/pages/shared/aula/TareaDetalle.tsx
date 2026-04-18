import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Textarea, Alert, Badge, Avatar, Card, FileInput } from '@/components/ui'
import type { Materia, Entrega } from '@/types'

interface Props { materia?: Materia }

export default function TareaDetalle({ materia }: Props) {
  const { tareaId } = useParams<{ tareaId: string }>()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id
  const tid = Number(tareaId)

  const [file, setFile]         = useState<File | null>(null)
  const [comentario, setCom]    = useState('')
  const [submitOk, setSubmitOk] = useState(false)
  const [calEntrega, setCal]    = useState<Entrega | null>(null)
  const [notaForm, setNotaForm] = useState({ nota: '', comentario_docente: '' })

  const { data: tarea } = useQuery({
    queryKey: ['tarea', mid, tid],
    queryFn: () => materiaService.getTarea(mid!, tid).then((r) => r.data),
    enabled: !!mid && !!tid,
  })
  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', mid, tid],
    queryFn: () => materiaService.getEntregas(mid!, tid).then((r) => r.data),
    enabled: !!mid && !!tid && isDocente,
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      if (file) fd.append('file', file)
      if (comentario) fd.append('comentario_alumno', comentario)
      return materiaService.submitEntrega(mid!, tid, fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tarea', mid, tid] })
      setSubmitOk(true); setFile(null); setCom('')
    },
  })

  const calMutation = useMutation({
    mutationFn: () => materiaService.calificarEntrega(mid!, tid, calEntrega!.id, {
      nota: Number(notaForm.nota), comentario_docente: notaForm.comentario_docente,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entregas', mid, tid] }); setCal(null) },
  })

  if (!tarea) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  const miEntrega = tarea.mi_entrega

  return (
    <div>
      <PageHeader title={tarea.title} description={`Puntaje máximo: ${tarea.puntaje_maximo} pts`} />
      {tarea.fecha_limite && (
        <p className="text-sm text-slate-500 mb-4">
          📅 Fecha límite: {new Date(tarea.fecha_limite).toLocaleString('es-AR')}
          {tarea.permite_entrega_tardia && <span className="ml-2 text-amber-600">(se aceptan entregas tardías)</span>}
        </p>
      )}
      {tarea.description && (
        <Card className="mb-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">📋 Consigna</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{tarea.description}</p>
        </Card>
      )}

      {/* Vista estudiante */}
      {!isDocente && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Tu entrega</h3>
          {submitOk && <Alert variant="success" className="mb-4">Entrega enviada correctamente.</Alert>}
          {miEntrega?.nota != null ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800">
                Calificada: {miEntrega.nota} / {tarea.puntaje_maximo} pts
              </p>
              {miEntrega.comentario_docente && (
                <p className="text-sm text-green-700 mt-1">{miEntrega.comentario_docente}</p>
              )}
            </div>
          ) : miEntrega ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">Entregada — Pendiente de calificación</p>
              {miEntrega.comentario_alumno && (
                <p className="text-xs text-amber-700 mt-1">{miEntrega.comentario_alumno}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <FileInput label="Archivo (opcional)" onChange={setFile} value={file} />
              <Textarea label="Comentario (opcional)" rows={3} value={comentario}
                onChange={(e) => setCom(e.target.value)} />
              <Button onClick={() => submitMutation.mutate()} loading={submitMutation.isPending}>
                Enviar entrega
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Vista docente */}
      {isDocente && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Entregas recibidas ({entregas.length})
          </h3>
          {entregas.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Ningún estudiante entregó aún.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {entregas.map((e) => (
                <Card key={e.id}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      {e.estudiante && <Avatar src={e.estudiante.avatar} name={e.estudiante.name} size="sm" />}
                      <div>
                        <p className="font-medium text-slate-900">{e.estudiante?.name}</p>
                        <p className="text-xs text-slate-400">{e.estudiante?.email}</p>
                        {e.comentario_alumno && (
                          <p className="text-xs text-slate-500 mt-1">{e.comentario_alumno}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {e.nota != null
                        ? <Badge variant="success">Nota: {e.nota}</Badge>
                        : <Badge variant="warning">Sin calificar</Badge>
                      }
                      {e.file_path && (
                        <a href={`/api/materias/${mid}/tareas/${tid}/entregas/${e.id}/descargar`}
                           target="_blank" rel="noreferrer">
                          <Button size="sm" variant="secondary">Ver archivo</Button>
                        </a>
                      )}
                      <Button size="sm" onClick={() => {
                        setCal(e)
                        setNotaForm({ nota: String(e.nota ?? ''), comentario_docente: e.comentario_docente ?? '' })
                      }}>
                        {e.nota != null ? 'Editar nota' : 'Calificar'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Panel calificar inline */}
          {calEntrega && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCal(null)} />
              <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
                <h3 className="font-semibold text-slate-900">
                  Calificar — {calEntrega.estudiante?.name}
                </h3>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Nota <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={0} max={tarea.puntaje_maximo}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={notaForm.nota}
                    onChange={(e) => setNotaForm((f) => ({ ...f, nota: e.target.value }))} />
                  <p className="text-xs text-slate-400 mt-1">Máximo: {tarea.puntaje_maximo} pts</p>
                </div>
                <Textarea label="Comentario al estudiante" rows={3}
                  value={notaForm.comentario_docente}
                  onChange={(e) => setNotaForm((f) => ({ ...f, comentario_docente: e.target.value }))} />
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={() => setCal(null)}>Cancelar</Button>
                  <Button onClick={() => calMutation.mutate()} loading={calMutation.isPending}>
                    Guardar nota
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
