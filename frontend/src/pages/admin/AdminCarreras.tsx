import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { PageHeader, Button, Input, Textarea, Table, Badge, Modal, ConfirmDialog, Alert, Toggle, Card } from '@/components/ui'
import type { Carrera } from '@/types'

interface FormState { name: string; description: string; active: boolean }
const EMPTY: FormState = { name: '', description: '', active: true }

export default function AdminCarreras() {
  const qc = useQueryClient()
  const [modalOpen, setModal] = useState(false)
  const [editItem, setEdit]   = useState<Carrera | null>(null)
  const [toDelete, setDelete] = useState<Carrera | null>(null)
  const [form, setForm]       = useState<FormState>(EMPTY)
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-carreras'],
    queryFn: () => adminService.getCarreras().then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => editItem
      ? adminService.updateCarrera(editItem.id, form)
      : adminService.createCarrera(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-carreras'] }); close() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error al guardar.'),
  })

  const delMutation = useMutation({
    mutationFn: () => adminService.deleteCarrera(toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-carreras'] }); setDelete(null) },
  })

  const open = (c?: Carrera) => {
    setEdit(c ?? null)
    setForm(c ? { name: c.name, description: c.description ?? '', active: c.active } : EMPTY)
    setFormErr(null); setModal(true)
  }
  const close = () => { setModal(false); setEdit(null); setForm(EMPTY); setFormErr(null) }

  const columns = [
    { key: 'name', header: 'Carrera',
      render: (c: Carrera) => (
        <div>
          <p className="font-medium text-slate-900">{c.name}</p>
          {c.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>}
        </div>
      ),
    },
    { key: 'materias_count', header: 'Materias',
      render: (c: Carrera) => <Badge variant="primary">{c.materias_count ?? 0} materias</Badge>,
    },
    { key: 'active', header: 'Estado',
      render: (c: Carrera) => <Badge variant={c.active ? 'success' : 'slate'}>{c.active ? 'Activa' : 'Inactiva'}</Badge>,
    },
    { key: 'actions', header: '',
      render: (c: Carrera) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="secondary" onClick={() => open(c)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setDelete(c)}>Eliminar</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Carreras" description="Gestión de carreras y programas académicos"
        action={<Button onClick={() => open()}>+ Nueva carrera</Button>} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">{data.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total carreras</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{data.filter((c) => c.active).length}</p>
          <p className="text-xs text-slate-500 mt-1">Activas</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-slate-400">{data.filter((c) => !c.active).length}</p>
          <p className="text-xs text-slate-500 mt-1">Inactivas</p>
        </Card>
      </div>

      <Table columns={columns as any} data={data} loading={isLoading} keyField="id" />

      <Modal open={modalOpen} onClose={close} title={editItem ? 'Editar carrera' : 'Nueva carrera'}
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Crear'}</Button></>}>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Input label="Nombre de la carrera" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Textarea label="Descripción" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Toggle label="Carrera activa" checked={form.active} onChange={(v) => setForm((f) => ({ ...f, active: v }))} />
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar carrera"
        description={`¿Eliminar "${toDelete?.name}"? Se eliminarán también sus materias asociadas.`} confirmLabel="Eliminar" />
    </div>
  )
}
