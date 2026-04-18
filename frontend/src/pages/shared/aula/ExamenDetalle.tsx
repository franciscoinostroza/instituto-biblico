import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Textarea, Select, Alert, Badge, Card } from '@/components/ui'
import type { Materia, Examen, Pregunta, TipoPregunta, IntentoExamen } from '@/types'

interface Props { materia?: Materia }

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

type OpcionForm = { texto: string; es_correcta: boolean }
interface PreguntaForm {
  enunciado: string; tipo: TipoPregunta; puntaje: number; orden: number
  opciones: OpcionForm[]
}

function defaultOpciones(tipo: TipoPregunta): OpcionForm[] {
  if (tipo === 'verdadero_falso') return [{ texto: 'Verdadero', es_correcta: false }, { texto: 'Falso', es_correcta: false }]
  if (tipo === 'multiple_choice') return Array.from({ length: 4 }, () => ({ texto: '', es_correcta: false }))
  return []
}

// ─── Editor de Examen (Docente) ───────────────────────────────────────────────
function EditorExamen({ examen, mid }: { examen: Examen; mid: number }) {
  const qc = useQueryClient()
  const eid = examen.id
  const preguntas = [...(examen.preguntas ?? [])].sort((a, b) => a.orden - b.orden)

  const [pregModal, setPregModal] = useState(false)
  const [editPregunta, setEditPregunta] = useState<Pregunta | null>(null)
  const [pregForm, setPregForm] = useState<PreguntaForm>({
    enunciado: '', tipo: 'multiple_choice', puntaje: 1, orden: 1,
    opciones: defaultOpciones('multiple_choice'),
  })
  const [pregErr, setPregErr] = useState<string | null>(null)

  const openPregModal = (p?: Pregunta) => {
    if (p) {
      setEditPregunta(p)
      setPregForm({
        enunciado: p.enunciado, tipo: p.tipo, puntaje: p.puntaje, orden: p.orden,
        opciones: p.opciones?.map((o) => ({ texto: o.texto, es_correcta: o.es_correcta ?? false }))
          ?? defaultOpciones(p.tipo),
      })
    } else {
      setEditPregunta(null)
      setPregForm({
        enunciado: '', tipo: 'multiple_choice', puntaje: 1,
        orden: preguntas.length + 1,
        opciones: defaultOpciones('multiple_choice'),
      })
    }
    setPregErr(null); setPregModal(true)
  }

  const savePregMutation = useMutation({
    mutationFn: () => editPregunta
      ? materiaService.updatePregunta(mid, eid, editPregunta.id, pregForm)
      : materiaService.createPregunta(mid, eid, pregForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['examen', mid, eid] }); setPregModal(false) },
    onError: (e: any) => setPregErr(e?.response?.data?.message ?? 'Error.'),
  })

  const delPregMutation = useMutation({
    mutationFn: (id: number) => materiaService.deletePregunta(mid, eid, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examen', mid, eid] }),
  })

  const changeTipo = (tipo: TipoPregunta) => {
    setPregForm((f) => ({ ...f, tipo, opciones: defaultOpciones(tipo) }))
  }

  const setCorrecta = (idx: number) => {
    setPregForm((f) => ({ ...f, opciones: f.opciones.map((o, i) => ({ ...o, es_correcta: i === idx })) }))
  }

  const puntajeTotal = preguntas.reduce((acc, p) => acc + p.puntaje, 0)

  return (
    <div>
      <PageHeader
        title={examen.title}
        description={`${examen.tipo === 'examen' ? 'Examen' : 'Control de lectura'} — ${preguntas.length} preguntas — ${puntajeTotal} pts`}
      />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Preguntas</h3>
        <Button onClick={() => openPregModal()}>+ Agregar pregunta</Button>
      </div>

      {preguntas.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400 text-center py-6">
            No hay preguntas aún. Agrega la primera.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {preguntas.map((p, i) => (
            <Card key={p.id}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={p.tipo === 'multiple_choice' ? 'primary' : p.tipo === 'verdadero_falso' ? 'gold' : 'slate'}>
                      {p.tipo === 'multiple_choice' ? 'Opción múltiple' : p.tipo === 'verdadero_falso' ? 'V/F' : 'Desarrollo'}
                    </Badge>
                    <span className="text-xs text-slate-400">{p.puntaje} pt{p.puntaje !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{p.enunciado}</p>
                  {p.opciones && p.opciones.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {p.opciones.map((o) => (
                        <li key={o.id} className={`text-xs flex items-center gap-1.5 ${o.es_correcta ? 'text-green-700 font-semibold' : 'text-slate-500'}`}>
                          <span>{o.es_correcta ? '✓' : '○'}</span>
                          {o.texto}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openPregModal(p)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => delPregMutation.mutate(p.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal pregunta */}
      <Modal open={pregModal} onClose={() => setPregModal(false)}
        title={editPregunta ? 'Editar pregunta' : 'Nueva pregunta'} size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPregModal(false)}>Cancelar</Button>
            <Button onClick={() => savePregMutation.mutate()} loading={savePregMutation.isPending}>
              {editPregunta ? 'Guardar' : 'Agregar'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          {pregErr && <Alert variant="danger">{pregErr}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" value={pregForm.tipo}
              onChange={(e) => changeTipo(e.target.value as TipoPregunta)}>
              <option value="multiple_choice">Opción múltiple</option>
              <option value="verdadero_falso">Verdadero / Falso</option>
              <option value="desarrollo">Desarrollo</option>
            </Select>
            <Input label="Puntaje" type="number" min={1} value={pregForm.puntaje}
              onChange={(e) => setPregForm((f) => ({ ...f, puntaje: Number(e.target.value) }))} />
          </div>
          <Textarea label="Enunciado" rows={3} required value={pregForm.enunciado}
            onChange={(e) => setPregForm((f) => ({ ...f, enunciado: e.target.value }))} />

          {pregForm.tipo !== 'desarrollo' && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Opciones <span className="text-xs text-slate-400 font-normal">(marcá la correcta)</span>
              </p>
              <div className="flex flex-col gap-2">
                {pregForm.opciones.map((op, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="radio" name="correcta" checked={op.es_correcta}
                      onChange={() => setCorrecta(i)}
                      className="accent-green-600 flex-shrink-0" />
                    {pregForm.tipo === 'multiple_choice' ? (
                      <input type="text" placeholder={`Opción ${i + 1}`} value={op.texto}
                        onChange={(e) => {
                          const ops = [...pregForm.opciones]
                          ops[i] = { ...ops[i], texto: e.target.value }
                          setPregForm((f) => ({ ...f, opciones: ops }))
                        }}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="text-sm text-slate-700">{op.texto}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

// ─── ExamenPlayer (Estudiante) ────────────────────────────────────────────────
function ExamenPlayer({ examen, mid }: { examen: Examen; mid: number }) {
  const qc = useQueryClient()
  const eid = examen.id
  const preguntas = [...(examen.preguntas ?? [])].sort((a, b) => a.orden - b.orden)
  const intentoPrevio = examen.mis_intentos?.[0] ?? null

  const [intento, setIntento] = useState<Pick<IntentoExamen, 'id' | 'estado' | 'nota_final' | 'iniciado_at' | 'finalizado_at'> | null>(null)
  const [respuestas, setResp] = useState<Record<number, { opcion_id?: number; texto_respuesta?: string }>>({})
  const [idx, setIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const submitRef = useRef(false)

  useEffect(() => {
    const src = intento ?? (intentoPrevio?.estado === 'en_progreso' ? intentoPrevio : null)
    if (!src || !examen.tiempo_limite_minutos) return
    const end = new Date(src.iniciado_at).getTime() + examen.tiempo_limite_minutos * 60_000
    const tick = setInterval(() => {
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setTimeLeft(left)
      if (left === 0 && !submitRef.current) {
        submitRef.current = true
        submitMutation.mutate()
        clearInterval(tick)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [intento?.id, intentoPrevio?.id])

  const iniciarMutation = useMutation({
    mutationFn: () => materiaService.iniciarIntento(mid, eid),
    onSuccess: (r) => {
      setIntento(r.data)
      qc.invalidateQueries({ queryKey: ['examen', mid, eid] })
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const id = intento?.id ?? intentoPrevio?.id
      const resps = Object.entries(respuestas).map(([pregId, r]) => ({
        pregunta_id: Number(pregId), ...r,
      }))
      if (resps.length > 0) {
        materiaService.responderIntento(mid, eid, id!, { respuestas: resps })
      }
      return materiaService.submitIntento(mid, eid, id!)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examen', mid, eid] }),
  })

  const setRespuesta = (pregId: number, data: { opcion_id?: number; texto_respuesta?: string }) => {
    setResp((r) => ({ ...r, [pregId]: data }))
  }

  const intentoActivo = intento ?? (intentoPrevio?.estado === 'en_progreso' ? intentoPrevio : null)

  // Examen ya completado (y no acabamos de entrar al player)
  if (!intentoActivo && intentoPrevio && intentoPrevio.estado !== 'en_progreso') {
    return (
      <div>
        <PageHeader title={examen.title} />
        <Card>
          <div className="text-center py-8">
            {intentoPrevio.nota_final != null ? (
              <>
                <p className="text-3xl font-bold text-green-700 mb-1">{intentoPrevio.nota_final} pts</p>
                <p className="text-sm text-slate-500">Examen calificado</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-700 mb-1">Examen entregado</p>
                <p className="text-sm text-slate-500">Pendiente de calificación final del docente</p>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Examen enviado en esta sesión
  if (submitMutation.isSuccess) {
    return (
      <div>
        <PageHeader title={examen.title} />
        <Card>
          <p className="text-sm text-green-700 font-semibold text-center py-8">
            Examen enviado correctamente. El docente revisará tus respuestas.
          </p>
        </Card>
      </div>
    )
  }

  // Pantalla de inicio
  if (!intentoActivo) {
    const now = new Date()
    const abre = examen.fecha_apertura ? new Date(examen.fecha_apertura) : null
    const cierra = examen.fecha_cierre ? new Date(examen.fecha_cierre) : null
    const cerrado = (abre && now < abre) || (cierra && now > cierra)
    const agotado = intentoPrevio && (examen.mis_intentos?.length ?? 0) >= examen.intentos_permitidos

    return (
      <div>
        <PageHeader title={examen.title} description={examen.descripcion ?? undefined} />
        <Card>
          <div className="flex flex-col gap-2 text-sm text-slate-600 mb-5">
            {examen.fecha_apertura && (
              <p>📅 Apertura: {new Date(examen.fecha_apertura).toLocaleString('es-AR')}</p>
            )}
            {examen.fecha_cierre && (
              <p>📅 Cierre: {new Date(examen.fecha_cierre).toLocaleString('es-AR')}</p>
            )}
            {examen.tiempo_limite_minutos && (
              <p>⏱ Tiempo límite: {examen.tiempo_limite_minutos} minutos</p>
            )}
            <p>📋 {preguntas.length} preguntas</p>
            <p>🔁 Intentos permitidos: {examen.intentos_permitidos}</p>
          </div>
          {cerrado ? (
            <Alert variant="danger">Este examen no está disponible en este momento.</Alert>
          ) : agotado ? (
            <Alert variant="warning">Ya usaste todos los intentos permitidos.</Alert>
          ) : (
            <Button onClick={() => iniciarMutation.mutate()} loading={iniciarMutation.isPending}>
              Iniciar examen
            </Button>
          )}
        </Card>
      </div>
    )
  }

  // Player activo
  const pregunta = preguntas[idx]
  if (!pregunta) return null
  const respActual = respuestas[pregunta.id] ?? {}
  const progreso = Object.keys(respuestas).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold text-slate-900">{examen.title}</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{progreso}/{preguntas.length} respondidas</span>
          {timeLeft !== null && (
            <span className={`font-mono text-sm font-bold px-3 py-1 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* Mapa de preguntas */}
      <div className="flex gap-1 flex-wrap mb-4">
        {preguntas.map((p, i) => (
          <button key={p.id} onClick={() => setIdx(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors
              ${i === idx
                ? 'bg-primary-600 text-white'
                : respuestas[p.id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {i + 1}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-400 mr-auto">
            Pregunta {idx + 1} de {preguntas.length}
          </span>
          <Badge variant={pregunta.tipo === 'multiple_choice' ? 'primary' : pregunta.tipo === 'verdadero_falso' ? 'gold' : 'slate'}>
            {pregunta.tipo === 'multiple_choice' ? 'Opción múltiple' : pregunta.tipo === 'verdadero_falso' ? 'V/F' : 'Desarrollo'}
          </Badge>
          <span className="text-xs text-slate-400">{pregunta.puntaje} pts</span>
        </div>

        <p className="text-sm text-slate-800 whitespace-pre-wrap mb-5">{pregunta.enunciado}</p>

        {(pregunta.tipo === 'multiple_choice' || pregunta.tipo === 'verdadero_falso') && (
          <div className="flex flex-col gap-2">
            {pregunta.opciones?.map((op) => (
              <label key={op.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                  ${respActual.opcion_id === op.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name={`p${pregunta.id}`}
                  checked={respActual.opcion_id === op.id}
                  onChange={() => setRespuesta(pregunta.id, { opcion_id: op.id })}
                  className="accent-primary-600" />
                <span className="text-sm text-slate-800">{op.texto}</span>
              </label>
            ))}
          </div>
        )}

        {pregunta.tipo === 'desarrollo' && (
          <Textarea rows={5} label="Tu respuesta" value={respActual.texto_respuesta ?? ''}
            onChange={(e) => setRespuesta(pregunta.id, { texto_respuesta: e.target.value })} />
        )}
      </Card>

      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
          ← Anterior
        </Button>
        {idx < preguntas.length - 1 ? (
          <Button onClick={() => setIdx((i) => i + 1)}>Siguiente →</Button>
        ) : (
          <Button onClick={() => submitMutation.mutate()} loading={submitMutation.isPending}>
            Entregar examen
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExamenDetalle({ materia }: Props) {
  const { examenId } = useParams<{ examenId: string }>()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id!
  const eid = Number(examenId)

  const { data: examen } = useQuery({
    queryKey: ['examen', mid, eid],
    queryFn: () => materiaService.getExamen(mid, eid).then((r) => r.data),
    enabled: !!mid && !!eid,
  })

  if (!examen) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  return isDocente
    ? <EditorExamen examen={examen} mid={mid} />
    : <ExamenPlayer examen={examen} mid={mid} />
}
