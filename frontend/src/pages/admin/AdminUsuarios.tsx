import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import {
  PageHeader, Button, Input, Select, Table, RolBadge,
  Modal, ConfirmDialog, Alert, Toggle, Avatar,
} from '@/components/ui'
import type { User, Role } from '@/types'

const ROL_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'docente', label: 'Docente' },
  { value: 'estudiante', label: 'Estudiante' },
]
const FORM_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'docente', label: 'Docente' },
  { value: 'estudiante', label: 'Estudiante' },
]

interface FormState {
  name: string; email: string; password: string
  role: Role; phone: string; active: boolean
}
const EMPTY: FormState = { name: '', email: '', password: '', role: 'estudiante', phone: '', active: true }

export default function AdminUsuarios() {
  const qc = useQueryClient()
  const [search, setSearch]   = useState('')
  const [role, setRole]       = useState('')
  const [modalOpen, setModal] = useState(false)
  const [editUser, setEdit]   = useState<User | null>(null)
  const [toDelete, setDelete] = useState<User | null>(null)
  const [form, setForm]       = useState<FormState>(EMPTY)
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-usuarios', search, role],
    queryFn: () => adminService.getUsuarios({ search: search || undefined, role: role || undefined })
      .then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => editUser
      ? adminService.updateUsuario(editUser.id, form)
      : adminService.createUsuario({ ...form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-usuarios'] }); close() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error al guardar.'),
  })

  const delMutation = useMutation({
    mutationFn: () => adminService.deleteUsuario(toDelete!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-usuarios'] }); setDelete(null) },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  const open = (u?: User) => {
    setEdit(u ?? null)
    setForm(u ? { name: u.name, email: u.email, password: '', role: u.role, phone: u.phone ?? '', active: u.active } : EMPTY)
    setFormErr(null); setModal(true)
  }
  const close = () => { setModal(false); setEdit(null); setForm(EMPTY); setFormErr(null) }
  const set = (k: keyof FormState, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const columns = [
    {
      key: 'name', header: 'Usuario',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <Avatar src={u.avatar} name={u.name} size="sm" />
          <div><p className="font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
        </div>
      ),
    },
    { key: 'role', header: 'Rol', render: (u: User) => <RolBadge role={u.role} /> },
    { key: 'phone', header: 'Teléfono', render: (u: User) => <span className="text-slate-500 text-sm">{u.phone ?? '—'}</span> },
    {
      key: 'active', header: 'Estado',
      render: (u: User) => <Toggle checked={u.active} onChange={() => toggleMutation.mutate(u.id)} label={u.active ? 'Activo' : 'Inactivo'} />,
    },
    {
      key: 'actions', header: '',
      render: (u: User) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="secondary" onClick={() => open(u)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => setDelete(u)}>Eliminar</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Usuarios" description="Gestión de todos los usuarios del sistema"
        action={<Button onClick={() => open()}>+ Nuevo usuario</Button>} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="Buscar nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-72"
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
        <Select options={ROL_OPTIONS} value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-44" placeholder="" />
      </div>

      {/* Resumen por rol */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {(['admin','docente','estudiante'] as Role[]).map((r) => (
          <button key={r} onClick={() => setRole(role === r ? '' : r)}
            className="bg-white rounded-xl border border-slate-100 px-4 py-2 flex items-center gap-2 shadow-sm hover:border-primary-200 transition-colors">
            <RolBadge role={r} />
            <span className="text-sm font-bold text-slate-700">{data.filter((u) => u.role === r).length}</span>
          </button>
        ))}
      </div>

      <Table columns={columns as any} data={data} loading={isLoading} keyField="id" />

      {/* Modal */}
      <Modal open={modalOpen} onClose={close} title={editUser ? 'Editar usuario' : 'Nuevo usuario'}
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editUser ? 'Guardar' : 'Crear'}</Button></>}>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Input label="Nombre completo" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label={editUser ? 'Nueva contraseña (vacío = sin cambio)' : 'Contraseña'} type="password" required={!editUser} value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Select label="Rol" required options={FORM_ROLES} value={form.role} onChange={(e) => set('role', e.target.value as Role)} placeholder="" />
          <Input label="Teléfono" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Toggle label="Usuario activo" checked={form.active} onChange={(v) => set('active', v)} />
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setDelete(null)} onConfirm={() => delMutation.mutate()}
        loading={delMutation.isPending} title="Eliminar usuario"
        description={`¿Eliminar a "${toDelete?.name}"? Esta acción no se puede deshacer.`} confirmLabel="Eliminar" />
    </div>
  )
}
