import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import api from '@/services/api'
import {
  PageHeader, Button, Input, Select, Textarea, Table, Badge,
  Modal, ConfirmDialog, Alert, Avatar, EmptyState, Tabs,
} from '@/components/ui'
import type { Materia, User, Carrera } from '@/types'

interface MateriaForm {
  name: string; code: string; description: string
  carrera_id: string; periodo_id: string; docente_id: string; active: boolean
}
const EMPTY_MATERIA: MateriaForm = { name: '', code: '', description: '', carrera_id: '', periodo_id: '', docente_id: '', active: true }

export default function AdminMaterias() {
  const qc = useQueryClient()
  const [tab, setTab]             = useState('lista')
  const [modalOpen, setModal]     = useState(false)
  const [inscModal, setInscModal] = useState(false)
  const [editItem, setEdit]       = useState<Materia | null>(null)
  const [toDelete, setDelete]     = useState<Materia | null>(null)
  const [form, setForm]           = useState<MateriaForm>(EMPTY_MATERIA)
  const [formErr, setFormErr]     = useState<string | null>(null)
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null)
  const [estudiantesIds, setEstudiantesIds]   = useState<number[]>([])

  const { data: materias = [], isLoading } = useQuery({
    queryKey: ['admin-materias'],
    queryFn: () => adminService.getMaterias().then((r) => r.data.data),
  })
  const { data: carreras = [] } = useQuery({
    queryKey: ['admin-carreras'],
    queryFn: () => adminService.getCarreras().then((r) => r.data),
  })
  const { data: periodos = [] } = useQuery({
    queryKey: ['periodos'],
    queryFn: () => api.get<any[]>('/admin/periodos').then((r) => r.data),
  })
  const { data: docentes = [] } = useQuery({
    queryKey: ['docentes'],
    queryFn: () => adminService.getUsuarios({ role: 'docente' }).then((r) => r.data.data),
  })
  const { data: estudiantes = [] } = useQuery({
    queryKey: ['estudiantes'],
    queryFn: () => adminService.getUsuarios({ role: 'estudiante' }).then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, docente_id: form.docente_id || undefined }
      return editItem ? adminService.updateMateria(editItem.id, payload) : adminService.createMateria(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-materias'] }); close() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error al guardar.'),
  })

  const delMutation = useMutation({
    mutationFn: () => adminService.deleteMateria(toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-materias'] }); setDelete(null) },
  })

  const inscribirMutation = useMutation({
    mutationFn: () => adminService.inscribirEstudiantes(selectedMateria!.id, estudiantesIds),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-materias'] }); setInscModal(false); setEstudiantesIds([]) },
  })

  const desinscribirMutation = useMutation({
    mutationFn: ({ materiaId, estId }: { materiaId: number; estId: number }) =>
      adminService.desinscribirEstudiante(materiaId, estId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-materias'] }),
  })

  const open = (m?: Materia) => {
    setEdit(m ?? null)
    setForm(m ? {
      name: m.name, code: m.code, description: m.description ?? '',
      carrera_id: String(m.carrera_id), periodo_id: String(m.periodo_id),
      docente_id: m.docente_id ? String(m.docente_id) : '', active: m.active,
    } : EMPTY_MATERIA)
    setFormErr(null); setModal(true)
  }
  const close = () => { setModal(false); setEdit(null); setForm(EMPTY_MATERIA); setFormErr(null) }
  const set = (k: keyof MateriaForm, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const openInscripcion = (m: Materia) => { setSelectedMateria(m); setEstudiantesIds([]); setInscModal(true) }

  const toggleEstudiante = (id: number) =>
    setEstudiantesIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

  const columns = [
    { key: 'name', header: 'Materia',
      render: (m: Materia) => (
        <div>
          <p className="font-medium text-slate-900">{m.name}</p>
          <p className="text-xs font-mono text-slate-400">{m.code}</p>
        </div>
      ),
    },
    { key: 'carrera', header: 'Carrera',
      render: (m: Materia) => <span className="text-sm text-slate-600">{m.carrera?.name ?? '—'}</span>,
    },
    { key: 'docente', header: 'Docente',
      render: (m: Materia) => m.docente ? (
        <div className="flex items-center gap-2">
          <Avatar src={m.docente.avatar} name={m.docente.name} size="xs" />
          <span className="text-sm text-slate-700">{m.docente.name}</span>
        </div>
      ) : <span className="text-slate-400 text-sm">Sin asignar</span>,
    },
    { key: 'inscripciones_count', header: 'Alumnos',
      render: (m: Materia) => <Badge variant="primary">{m.inscripciones_count ?? 0}</Badge>,
    },
    { key: 'active', header: 'Estado',
      render: (m: Materia) => <Badge variant={m.active ? 'success' : 'slate'}>{m.active ? 'Activa' : 'Inactiva'}</Badge>,
    },
    { key: 'actions', header: '',
      render: (m: Materia) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => openInscripcion(m)}>Inscripciones</Button>
          <Button size="sm" variant="secondary" onClick={() => open(m)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setDelete(m)}>Eliminar</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Materias" description="Gestión de materias, docentes e inscripciones"
        action={<Button onClick={() => open()}>+ Nueva materia</Button>} />

      <div className="mb-5">
        <Tabs
          tabs={[{ id: 'lista', label: 'Todas las materias', icon: '📚' }, { id: 'activas', label: 'Activas', icon: '✅' }]}
          active={tab} onChange={setTab}
        />
      </div>

      <Table
        columns={columns as any}
        data={tab === 'activas' ? materias.filter((m) => m.active) : materias}
        loading={isLoading}
        keyField="id"
      />

      {/* Modal Materia */}
      <Modal open={modalOpen} onClose={close} title={editItem ? 'Editar materia' : 'Nueva materia'} size="lg"
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Crear'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          {formErr && <div className="col-span-2"><Alert variant="danger">{formErr}</Alert></div>}
          <div className="col-span-2">
            <Input label="Nombre" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <Input label="Código" required value={form.code} onChange={(e) => set('code', e.target.value)} hint="Ej: TEO-101" />
          <Select label="Carrera" required placeholder="Seleccionar..."
            options={carreras.map((c: Carrera) => ({ value: c.id, label: c.name }))}
            value={form.carrera_id} onChange={(e) => set('carrera_id', e.target.value)} />
          <Select label="Período lectivo" required placeholder="Seleccionar..."
            options={periodos.map((p: any) => ({ value: p.id, label: p.name }))}
            value={form.periodo_id} onChange={(e) => set('periodo_id', e.target.value)} />
          <Select label="Docente" placeholder="Sin asignar"
            options={docentes.map((d: User) => ({ value: d.id, label: d.name }))}
            value={form.docente_id} onChange={(e) => set('docente_id', e.target.value)} />
          <div className="col-span-2">
            <Textarea label="Descripción" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Modal Inscripciones */}
      <Modal open={inscModal} onClose={() => setInscModal(false)} title={`Inscripciones — ${selectedMateria?.name}`} size="lg"
        footer={
          <><Button variant="ghost" onClick={() => setInscModal(false)}>Cerrar</Button>
          {estudiantesIds.length > 0 && (
            <Button onClick={() => inscribirMutation.mutate()} loading={inscribirMutation.isPending}>
              Inscribir {estudiantesIds.length} estudiante{estudiantesIds.length > 1 ? 's' : ''}
            </Button>
          )}</>
        }>
        {estudiantes.length === 0 ? (
          <EmptyState icon="👤" title="Sin estudiantes" description="No hay estudiantes registrados en el sistema." />
        ) : (
          <div>
            <p className="text-xs text-slate-500 mb-3">Seleccioná los estudiantes a inscribir:</p>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {estudiantes.map((e: User) => (
                <button
                  key={e.id}
                  onClick={() => toggleEstudiante(e.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    estudiantesIds.includes(e.id) ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <input type="checkbox" readOnly checked={estudiantesIds.includes(e.id)} className="accent-primary-600" />
                  <Avatar src={e.avatar} name={e.name} size="xs" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{e.name}</p>
                    <p className="text-xs text-slate-500">{e.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar materia"
        description={`¿Eliminar "${toDelete?.name}"? Se eliminarán todos sus contenidos e inscripciones.`} confirmLabel="Eliminar" />
    </div>
  )
}
