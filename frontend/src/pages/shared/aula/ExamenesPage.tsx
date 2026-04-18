import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Textarea, Select, Alert, ConfirmDialog, EmptyState, Badge, Card } from '@/components/ui'
import type { Materia, Examen } from '@/types'

interface Props { materia?: Materia }

function EstadoBadge({ examen }: { examen: Examen }) {
  const now = new Date()
  const abre = examen.fecha_apertura ? new Date(examen.fecha_apertura) : null
  const cierra = examen.fecha_cierre ? new Date(examen.fecha_cierre) : null
  if (abre && now < abre) return <Badge variant="warning">Programado</Badge>
  if (cierra && now > cierra) return <Badge variant="slate">Cerrado</Badge>
  return <Badge variant="success">Abierto</Badge>
}

type FormState = {
  title: string; descripcion: string; tipo: 'examen' | 'control_lectura'
  fecha_apertura: string; fecha_cierre: string
  tiempo_limite_minutos: string; intentos_permitidos: number
}

const FORM_DEFAULT: FormState = {
  title: '', descripcion: '', tipo: 'examen',
  fecha_apertura: '', fecha_cierre: '',
  tiempo_limite_minutos: '', intentos_permitidos: 1,
}

export default function ExamenesPage({ materia }: Props) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id

  const [modalOpen, setModal] = useState(false)
  const [editItem, setEdit]   = useState<Examen | null>(null)
  const [toDelete, setDelete] = useState<Examen | null>(null)
  const [form, setForm]       = useState<FormState>(FORM_DEFAULT)
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data: examenes = [], isLoading } = useQuery({
    queryKey: ['examenes', mid],
    queryFn: () => materiaService.getExamenes(mid!).then((r) => r.data),
    enabled: !!mid,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        tiempo_limite_minutos: form.tiempo_limite_minutos ? Number(form.tiempo_limite_minutos) : null,
        fecha_apertura: form.fecha_apertura || null,
        fecha_cierre: form.fecha_cierre || null,
      }
      return editItem
        ? materiaService.updateExamen(mid!, editItem.id, payload)
        : materiaService.createExamen(mid!, payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['examenes', mid] }); closeModal() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error.'),
  })

  const delMutation = useMutation({
    mutationFn: () => materiaService.deleteExamen(mid!, toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['examenes', mid] }); setDelete(null) },
  })

  const openModal = (ex?: Examen) => {
    setEdit(ex ?? null)
    setForm(ex ? {
      title: ex.title, descripcion: ex.descripcion ?? '', tipo: ex.tipo,
      fecha_apertura: ex.fecha_apertura?.slice(0, 16) ?? '',
      fecha_cierre: ex.fecha_cierre?.slice(0, 16) ?? '',
      tiempo_limite_minutos: ex.tiempo_limite_minutos ? String(ex.tiempo_limite_minutos) : '',
      intentos_permitidos: ex.intentos_permitidos,
    } : FORM_DEFAULT)
    setFormErr(null); setModal(true)
  }
  const closeModal = () => { setModal(false); setEdit(null); setFormErr(null) }

  if (isLoading) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  return (
    <div>
      <PageHeader title="Exámenes" description="Evaluaciones y controles de lectura"
        action={isDocente ? <Button onClick={() => openModal()}>+ Nuevo examen</Button> : undefined} />

      {examenes.length === 0 ? (
        <EmptyState icon="📝" title="Sin exámenes"
          description={isDocente ? 'Creá el primer examen.' : 'El docente no publicó exámenes aún.'}
          action={isDocente ? <Button onClick={() => openModal()}>+ Crear examen</Button> : undefined} />
      ) : (
        <div className="flex flex-col gap-3">
          {examenes.map((ex) => {
            const miIntento = ex.mis_intentos?.[0]
            const completado = miIntento && miIntento.estado !== 'en_progreso'
            return (
              <Card key={ex.id} hover onClick={() => navigate(`/materias/${mid}/examenes/${ex.id}`)} className="cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{ex.title}</p>
                      <Badge variant={ex.tipo === 'examen' ? 'primary' : 'gold'}>
                        {ex.tipo === 'examen' ? 'Examen' : 'Control de lectura'}
                      </Badge>
                      <EstadoBadge examen={ex} />
                      {!isDocente && completado && (
                        <Badge variant={miIntento.nota_final != null ? 'success' : 'warning'}>
                          {miIntento.nota_final != null ? `Nota: ${miIntento.nota_final}` : 'Pendiente calificación'}
                        </Badge>
                      )}
                      {isDocente && (
                        <Badge variant="slate">{ex.intentos_count ?? 0} intentos</Badge>
                      )}
                    </div>
                    {ex.descripcion && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ex.descripcion}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {ex.fecha_apertura && (
                        <span className="text-xs text-slate-400">
                          Apertura: {new Date(ex.fecha_apertura).toLocaleString('es-AR')}
                        </span>
                      )}
                      {ex.fecha_cierre && (
                        <span className="text-xs text-slate-400">
                          Cierre: {new Date(ex.fecha_cierre).toLocaleString('es-AR')}
                        </span>
                      )}
                      {ex.tiempo_limite_minutos && (
                        <span className="text-xs text-slate-400">⏱ {ex.tiempo_limite_minutos} min</span>
                      )}
                    </div>
                  </div>
                  {isDocente && (
                    <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => openModal(ex)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => setDelete(ex)}>Eliminar</Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Editar examen' : 'Nuevo examen'} size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              {editItem ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Input label="Título" required value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Descripción" rows={3} value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
          <Select label="Tipo" value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as FormState['tipo'] }))}>
            <option value="examen">Examen</option>
            <option value="control_lectura">Control de lectura</option>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Apertura" type="datetime-local" value={form.fecha_apertura}
              onChange={(e) => setForm((f) => ({ ...f, fecha_apertura: e.target.value }))} />
            <Input label="Cierre" type="datetime-local" value={form.fecha_cierre}
              onChange={(e) => setForm((f) => ({ ...f, fecha_cierre: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tiempo límite (minutos)" type="number" value={form.tiempo_limite_minutos}
              onChange={(e) => setForm((f) => ({ ...f, tiempo_limite_minutos: e.target.value }))} />
            <Input label="Intentos permitidos" type="number" min={1} value={form.intentos_permitidos}
              onChange={(e) => setForm((f) => ({ ...f, intentos_permitidos: Number(e.target.value) }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar examen"
        description={`¿Eliminar "${toDelete?.title}"? Se eliminarán todos los intentos.`}
        confirmLabel="Eliminar" />
    </div>
  )
}
