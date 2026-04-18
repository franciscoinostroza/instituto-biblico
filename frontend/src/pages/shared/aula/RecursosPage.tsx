import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Select, Textarea, Alert, ConfirmDialog, EmptyState, Badge, FileInput } from '@/components/ui'
import type { Materia, Recurso, TipoRecurso } from '@/types'

interface Props { materia?: Materia }

const TIPO_OPTS = [{ value: 'archivo', label: 'Archivo' }, { value: 'link', label: 'Enlace' }, { value: 'video', label: 'Video' }]
const TIPO_ICON: Record<TipoRecurso, string> = { archivo: '📄', link: '🔗', video: '🎥' }
const TIPO_BADGE: Record<TipoRecurso, 'primary' | 'gold' | 'success'> = { archivo: 'primary', link: 'gold', video: 'success' }

export default function RecursosPage({ materia }: Props) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id
  const [modalOpen, setModal] = useState(false)
  const [toDelete, setDelete] = useState<Recurso | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [form, setForm]       = useState({ title: '', description: '', type: 'archivo' as TipoRecurso, url: '', unidad: '', orden: 0 })
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data: recursos = [], isLoading } = useQuery({
    queryKey: ['recursos', mid],
    queryFn: () => materiaService.getRecursos(mid!).then((r) => r.data),
    enabled: !!mid,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (file) fd.append('file', file)
      return materiaService.createRecurso(mid!, fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recursos', mid] }); close() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error al guardar.'),
  })
  const delMutation = useMutation({
    mutationFn: () => materiaService.deleteRecurso(mid!, toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recursos', mid] }); setDelete(null) },
  })

  const open = () => { setForm({ title: '', description: '', type: 'archivo', url: '', unidad: '', orden: 0 }); setFile(null); setFormErr(null); setModal(true) }
  const close = () => { setModal(false); setFormErr(null) }

  // Agrupar por unidad
  const grupos = recursos.reduce((acc: Record<string, Recurso[]>, r) => {
    const key = r.unidad ?? 'Sin unidad'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  if (isLoading) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  return (
    <div>
      <PageHeader title="Recursos" description="Archivos, enlaces y videos de la materia"
        action={isDocente ? <Button onClick={open}>+ Agregar recurso</Button> : undefined} />

      {recursos.length === 0 ? (
        <EmptyState icon="📁" title="Sin recursos" description={isDocente ? 'Subí el primer recurso para tus estudiantes.' : 'El docente aún no subió recursos.'}
          action={isDocente ? <Button onClick={open}>+ Agregar recurso</Button> : undefined} />
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grupos).map(([unidad, items]) => (
            <div key={unidad}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{unidad}</h3>
              <div className="flex flex-col gap-2">
                {items.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                    <span className="text-2xl">{TIPO_ICON[r.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate">{r.title}</p>
                        <Badge variant={TIPO_BADGE[r.type]}>{r.type}</Badge>
                      </div>
                      {r.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {(r.url || r.file_path) && (
                        <a href={r.url ?? `/api/materias/${mid}/recursos/${r.id}/descargar`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="secondary">Abrir</Button>
                        </a>
                      )}
                      {isDocente && <Button size="sm" variant="danger" onClick={() => setDelete(r)}>Eliminar</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={close} title="Agregar recurso" size="lg"
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Agregar</Button></>}>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Input label="Título" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Descripción" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Select label="Tipo" required options={TIPO_OPTS} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TipoRecurso }))} placeholder="" />
          {form.type === 'archivo' && <FileInput label="Archivo" onChange={setFile} value={file} hint="Máx. 50MB" />}
          {(form.type === 'link' || form.type === 'video') && (
            <Input label="URL" required type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unidad" value={form.unidad} onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))} hint="Ej: Unidad 1" />
            <Input label="Orden" type="number" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))} />
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar recurso" description={`¿Eliminar "${toDelete?.title}"?`} confirmLabel="Eliminar" />
    </div>
  )
}
