import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Textarea, Alert, ConfirmDialog, EmptyState, Avatar } from '@/components/ui'
import type { Anuncio, Materia } from '@/types'

interface Props { materia?: Materia }
function fmt(iso: string) { return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) }

export default function AnunciosPage({ materia }: Props) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id
  const [modalOpen, setModal] = useState(false)
  const [editItem, setEdit]   = useState<Anuncio | null>(null)
  const [toDelete, setDelete] = useState<Anuncio | null>(null)
  const [form, setForm]       = useState({ title: '', body: '', published_at: '' })
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data: anuncios = [], isLoading } = useQuery({
    queryKey: ['anuncios', mid],
    queryFn: () => materiaService.getAnuncios(mid!).then((r) => r.data),
    enabled: !!mid,
  })
  const saveMutation = useMutation({
    mutationFn: () => editItem ? materiaService.updateAnuncio(mid!, editItem.id, form) : materiaService.createAnuncio(mid!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['anuncios', mid] }); close() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error al guardar.'),
  })
  const delMutation = useMutation({
    mutationFn: () => materiaService.deleteAnuncio(mid!, toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['anuncios', mid] }); setDelete(null) },
  })
  const open = (a?: Anuncio) => { setEdit(a ?? null); setForm(a ? { title: a.title, body: a.body, published_at: a.published_at ?? '' } : { title: '', body: '', published_at: '' }); setFormErr(null); setModal(true) }
  const close = () => { setModal(false); setEdit(null); setFormErr(null) }

  if (isLoading) return <div className="text-slate-400 py-10 text-center">Cargando...</div>
  return (
    <div>
      <PageHeader title="Anuncios" description="Comunicados y novedades de la materia"
        action={isDocente ? <Button onClick={() => open()}>+ Nuevo anuncio</Button> : undefined} />
      {anuncios.length === 0 ? (
        <EmptyState icon="📢" title="Sin anuncios" description={isDocente ? 'Publicá el primer anuncio para tus estudiantes.' : 'El docente aún no publicó anuncios.'}
          action={isDocente ? <Button onClick={() => open()}>+ Crear anuncio</Button> : undefined} />
      ) : (
        <div className="flex flex-col gap-4">
          {anuncios.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {a.autor && <Avatar src={a.autor.avatar} name={a.autor.name} size="sm" />}
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.autor?.name} · {a.published_at ? fmt(a.published_at) : 'Sin publicar'}</p>
                  </div>
                </div>
                {isDocente && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => open(a)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => setDelete(a)}>Eliminar</Button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={close} title={editItem ? 'Editar anuncio' : 'Nuevo anuncio'} size="lg"
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Publicar'}</Button></>}>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Input label="Título" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Contenido" required rows={6} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <Input label="Fecha de publicación" type="datetime-local" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} hint="Vacío = publicar ahora" />
        </div>
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar anuncio" description={`¿Eliminar "${toDelete?.title}"?`} confirmLabel="Eliminar" />
    </div>
  )
}
