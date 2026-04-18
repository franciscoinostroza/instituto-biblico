import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { institutoService } from '@/services/institutoService'
import api from '@/services/api'
import { PageHeader, Button, Input, Textarea, Card, CardHeader, CardTitle, Alert, FileInput, Modal, ConfirmDialog, Table, Badge } from '@/components/ui'

export default function AdminConfiguracion() {
  const qc = useQueryClient()
  const [tab, setTab]         = useState<'instituto'|'periodos'>('instituto')
  const [instForm, setInst]   = useState({ name: '', description: '', address: '', phone: '', email: '', website: '' })
  const [logo, setLogo]       = useState<File | null>(null)
  const [instOk, setInstOk]   = useState(false)
  const [perModal, setPerModal] = useState(false)
  const [toDeletePer, setDeletePer] = useState<any>(null)
  const [perForm, setPerForm] = useState({ name: '', year: new Date().getFullYear(), semester: 1, date_start: '', date_end: '', active: false })

  const { data: instituto } = useQuery({
    queryKey: ['instituto'],
    queryFn: () => institutoService.getInstituto().then((r) => r.data),
  })

  const { data: periodos = [], isLoading: perLoading } = useQuery({
    queryKey: ['periodos'],
    queryFn: () => api.get<any[]>('/admin/periodos').then((r) => r.data),
  })

  useEffect(() => {
    if (instituto) {
      setInst({
        name: instituto.name ?? '', description: instituto.description ?? '',
        address: instituto.address ?? '', phone: instituto.phone ?? '',
        email: instituto.email ?? '', website: instituto.website ?? '',
      })
    }
  }, [instituto])

  const instMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(instForm).forEach(([k, v]) => fd.append(k, v))
      if (logo) fd.append('logo', logo)
      return institutoService.updateInstituto(fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['instituto'] }); setInstOk(true); setTimeout(() => setInstOk(false), 3000) },
  })

  const perMutation = useMutation({
    mutationFn: () => api.post('/admin/periodos', perForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periodos'] }); setPerModal(false) },
  })

  const delPerMutation = useMutation({
    mutationFn: () => api.delete(`/admin/periodos/${toDeletePer.id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['periodos'] }); setDeletePer(null) },
  })

  const perColumns = [
    { key: 'name', header: 'Período', render: (p: any) => <span className="font-medium">{p.name}</span> },
    { key: 'year', header: 'Año', render: (p: any) => <span>{p.year} — Sem. {p.semester}</span> },
    { key: 'date_start', header: 'Fechas', render: (p: any) => <span className="text-sm text-slate-500">{p.date_start} → {p.date_end}</span> },
    { key: 'active', header: 'Estado', render: (p: any) => <Badge variant={p.active ? 'success' : 'slate'}>{p.active ? 'Activo' : 'Cerrado'}</Badge> },
    { key: 'actions', header: '', render: (p: any) => (
      <Button size="sm" variant="danger" onClick={() => setDeletePer(p)}>Eliminar</Button>
    )},
  ]

  return (
    <div>
      <PageHeader title="Configuración" description="Información institucional y períodos lectivos" />

      {/* Tabs manuales simples */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'instituto', label: '🏛️ Instituto' }, { id: 'periodos', label: '📅 Períodos lectivos' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'instituto' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Datos institucionales</CardTitle></CardHeader>
              {instOk && <Alert variant="success" className="mb-4">Cambios guardados correctamente.</Alert>}
              <div className="flex flex-col gap-4">
                <Input label="Nombre del instituto" required value={instForm.name} onChange={(e) => setInst((f) => ({ ...f, name: e.target.value }))} />
                <Textarea label="Descripción" rows={3} value={instForm.description} onChange={(e) => setInst((f) => ({ ...f, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Dirección" value={instForm.address} onChange={(e) => setInst((f) => ({ ...f, address: e.target.value }))} />
                  <Input label="Teléfono" value={instForm.phone} onChange={(e) => setInst((f) => ({ ...f, phone: e.target.value }))} />
                  <Input label="Email" type="email" value={instForm.email} onChange={(e) => setInst((f) => ({ ...f, email: e.target.value }))} />
                  <Input label="Sitio web" value={instForm.website} onChange={(e) => setInst((f) => ({ ...f, website: e.target.value }))} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => instMutation.mutate()} loading={instMutation.isPending}>Guardar cambios</Button>
                </div>
              </div>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
              {instituto?.logo && (
                <img src={instituto.logo} alt="Logo" className="w-full h-32 object-contain rounded-lg border border-slate-100 mb-4" />
              )}
              <FileInput label="Subir nuevo logo" accept="image/*" onChange={setLogo} value={logo} hint="PNG o JPG, máx 2MB" />
            </Card>
          </div>
        </div>
      )}

      {tab === 'periodos' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setPerForm({ name: '', year: new Date().getFullYear(), semester: 1, date_start: '', date_end: '', active: false }); setPerModal(true) }}>
              + Nuevo período
            </Button>
          </div>
          <Table columns={perColumns as any} data={periodos} loading={perLoading} keyField="id" />

          <Modal open={perModal} onClose={() => setPerModal(false)} title="Nuevo período lectivo"
            footer={<><Button variant="ghost" onClick={() => setPerModal(false)}>Cancelar</Button><Button onClick={() => perMutation.mutate()} loading={perMutation.isPending}>Crear</Button></>}>
            <div className="flex flex-col gap-4">
              <Input label="Nombre" required value={perForm.name} onChange={(e) => setPerForm((f) => ({ ...f, name: e.target.value }))} hint="Ej: Primer Semestre 2025" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Año" type="number" required value={perForm.year} onChange={(e) => setPerForm((f) => ({ ...f, year: Number(e.target.value) }))} />
                <Input label="Semestre" type="number" required value={perForm.semester} onChange={(e) => setPerForm((f) => ({ ...f, semester: Number(e.target.value) }))} hint="1 o 2" />
                <Input label="Fecha inicio" type="date" required value={perForm.date_start} onChange={(e) => setPerForm((f) => ({ ...f, date_start: e.target.value }))} />
                <Input label="Fecha fin" type="date" required value={perForm.date_end} onChange={(e) => setPerForm((f) => ({ ...f, date_end: e.target.value }))} />
              </div>
            </div>
          </Modal>

          <ConfirmDialog open={!!toDeletePer} onClose={() => setDeletePer(null)} onConfirm={() => delPerMutation.mutate()}
            loading={delPerMutation.isPending} title="Eliminar período"
            description={`¿Eliminar "${toDeletePer?.name}"?`} confirmLabel="Eliminar" />
        </div>
      )}
    </div>
  )
}
