import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Textarea, Alert, ConfirmDialog, EmptyState, Badge, Toggle, Card } from '@/components/ui'
import type { Materia, Tarea } from '@/types'

interface Props { materia?: Materia }

function diasRestantes(fecha: string | null) {
  if (!fecha) return null
  const diff = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000)
  return diff
}

export default function TareasPage({ materia }: Props) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id
  const [modalOpen, setModal] = useState(false)
  const [editItem, setEdit]   = useState<Tarea | null>(null)
  const [toDelete, setDelete] = useState<Tarea | null>(null)
  const [form, setForm]       = useState({ title: '', description: '', fecha_limite: '', puntaje_maximo: 100, permite_entrega_tardia: false })
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data: tareas = [], isLoading } = useQuery({
    queryKey: ['tareas', mid],
    queryFn: () => materiaService.getTareas(mid!).then((r) => r.data),
    enabled: !!mid,
  })
  const saveMutation = useMutation({
    mutationFn: () => editItem ? materiaService.updateTarea(mid!, editItem.id, form) : materiaService.createTarea(mid!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tareas', mid] }); close() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error.'),
  })
  const delMutation = useMutation({
    mutationFn: () => materiaService.deleteTarea(mid!, toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tareas', mid] }); setDelete(null) },
  })

  const open = (t?: Tarea) => {
    setEdit(t ?? null)
    setForm(t ? { title: t.title, description: t.description ?? '', fecha_limite: t.fecha_limite?.slice(0, 16) ?? '', puntaje_maximo: t.puntaje_maximo, permite_entrega_tardia: t.permite_entrega_tardia } : { title: '', description: '', fecha_limite: '', puntaje_maximo: 100, permite_entrega_tardia: false })
    setFormErr(null); setModal(true)
  }
  const close = () => { setModal(false); setEdit(null); setFormErr(null) }

  if (isLoading) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  return (
    <div>
      <PageHeader title="Tareas" description="Trabajos prácticos y entregas"
        action={isDocente ? <Button onClick={() => open()}>+ Nueva tarea</Button> : undefined} />

      {tareas.length === 0 ? (
        <EmptyState icon="✏️" title="Sin tareas" description={isDocente ? 'Creá la primera tarea para tus estudiantes.' : 'El docente aún no publicó tareas.'}
          action={isDocente ? <Button onClick={() => open()}>+ Crear tarea</Button> : undefined} />
      ) : (
        <div className="flex flex-col gap-3">
          {tareas.map((t) => {
            const dias = diasRestantes(t.fecha_limite)
            const entregada = !!t.mi_entrega
            const calificada = t.mi_entrega?.nota != null
            return (
              <Card key={t.id} hover onClick={() => navigate(`/materias/${mid}/tareas/${t.id}`)} className="cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{t.title}</p>
                      {!isDocente && entregada && <Badge variant={calificada ? 'success' : 'gold'}>{calificada ? `Nota: ${t.mi_entrega?.nota}` : 'Entregada'}</Badge>}
                      {isDocente && <Badge variant="primary">{t.entregas_count ?? 0} entregas</Badge>}
                    </div>
                    {t.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">Puntaje: {t.puntaje_maximo} pts</span>
                      {t.fecha_limite && (
                        <span className={`text-xs font-medium ${dias !== null && dias < 0 ? 'text-red-500' : dias !== null && dias <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                          {dias !== null && dias < 0 ? `Venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}` : dias === 0 ? 'Vence hoy' : `Vence en ${dias} días`}
                        </span>
                      )}
                    </div>
                  </div>
                  {isDocente && (
                    <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => open(t)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => setDelete(t)}>Eliminar</Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={close} title={editItem ? 'Editar tarea' : 'Nueva tarea'} size="lg"
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Crear'}</Button></>}>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Input label="Título" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Descripción / Consigna" rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha límite" type="datetime-local" value={form.fecha_limite} onChange={(e) => setForm((f) => ({ ...f, fecha_limite: e.target.value }))} />
            <Input label="Puntaje máximo" type="number" value={form.puntaje_maximo} onChange={(e) => setForm((f) => ({ ...f, puntaje_maximo: Number(e.target.value) }))} />
          </div>
          <Toggle label="Permitir entregas tardías" checked={form.permite_entrega_tardia} onChange={(v) => setForm((f) => ({ ...f, permite_entrega_tardia: v }))} />
        </div>
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar tarea" description={`¿Eliminar "${toDelete?.title}"? Se eliminarán todas las entregas.`} confirmLabel="Eliminar" />
    </div>
  )
}
