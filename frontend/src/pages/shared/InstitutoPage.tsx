import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { institutoService } from '@/services/institutoService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Textarea, Alert, Badge, Card, EmptyState } from '@/components/ui'
import type { NoticiaInstituto, CalendarioAcademico, DocumentoInstituto } from '@/types'

type Tab = 'info' | 'noticias' | 'calendario' | 'documentos'

const TAB_LABELS: { key: Tab; label: string; icon: string }[] = [
  { key: 'info',        label: 'Instituto',    icon: '🏛️' },
  { key: 'noticias',    label: 'Noticias',     icon: '📰' },
  { key: 'calendario',  label: 'Calendario',   icon: '📅' },
  { key: 'documentos',  label: 'Documentos',   icon: '📄' },
]

// ─── Tab: Noticias ────────────────────────────────────────────────────────────
function NoticiasList({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editItem, setEdit] = useState<NoticiaInstituto | null>(null)
  const [form, setForm] = useState({ title: '', body: '' })
  const [err, setErr] = useState<string | null>(null)

  const { data: noticias = [] } = useQuery({
    queryKey: ['noticias'],
    queryFn: () => institutoService.getNoticias().then((r) => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => editItem
      ? institutoService.updateNoticia(editItem.id, form)
      : institutoService.createNoticia(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['noticias'] }); close() },
    onError: (e: any) => setErr(e?.response?.data?.message ?? 'Error.'),
  })

  const delMutation = useMutation({
    mutationFn: (id: number) => institutoService.deleteNoticia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['noticias'] }),
  })

  const open = (n?: NoticiaInstituto) => {
    setEdit(n ?? null)
    setForm(n ? { title: n.title, body: n.body } : { title: '', body: '' })
    setErr(null); setModal(true)
  }
  const close = () => { setModal(false); setEdit(null); setErr(null) }

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => open()}>+ Nueva noticia</Button>
        </div>
      )}
      {noticias.length === 0 ? (
        <EmptyState icon="📰" title="Sin noticias" description="No hay noticias publicadas aún." />
      ) : (
        <div className="flex flex-col gap-4">
          {noticias.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">{n.title}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-3">
                    {n.author?.name} · {new Date(n.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => open(n)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => delMutation.mutate(n.id)}>Eliminar</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={close} title={editItem ? 'Editar noticia' : 'Nueva noticia'}
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Publicar'}</Button></>}>
        <div className="flex flex-col gap-4">
          {err && <Alert variant="danger">{err}</Alert>}
          <Input label="Título" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Contenido" rows={6} required value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}

// ─── Tab: Calendario ─────────────────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function CalendarioTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())
  const [modal, setModal] = useState(false)
  const [editItem, setEdit] = useState<CalendarioAcademico | null>(null)
  const [form, setForm] = useState({ title: '', description: '', date_start: '', date_end: '', color: '#3B82F6' })

  const { data: eventos = [] } = useQuery({
    queryKey: ['calendario', mes, anio],
    queryFn: () => institutoService.getCalendario(mes, anio).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => editItem
      ? institutoService.updateEvento(editItem.id, form)
      : institutoService.createEvento(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['calendario'] }); close() },
  })

  const delMutation = useMutation({
    mutationFn: (id: number) => institutoService.deleteEvento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendario', mes, anio] }),
  })

  const open = (ev?: CalendarioAcademico) => {
    setEdit(ev ?? null)
    setForm(ev ? { title: ev.title, description: ev.description ?? '', date_start: ev.date_start, date_end: ev.date_end, color: ev.color } : { title: '', description: '', date_start: '', date_end: '', color: '#3B82F6' })
    setModal(true)
  }
  const close = () => { setModal(false); setEdit(null) }

  const prevMes = () => { if (mes === 1) { setMes(12); setAnio((y) => y - 1) } else setMes((m) => m - 1) }
  const nextMes = () => { if (mes === 12) { setMes(1); setAnio((y) => y + 1) } else setMes((m) => m + 1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevMes}>←</Button>
          <span className="font-semibold text-slate-700 min-w-[140px] text-center">
            {MESES[mes - 1]} {anio}
          </span>
          <Button variant="ghost" size="sm" onClick={nextMes}>→</Button>
        </div>
        {isAdmin && <Button size="sm" onClick={() => open()}>+ Agregar evento</Button>}
      </div>

      {eventos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No hay eventos este mes.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {eventos.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white">
              <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{ev.title}</p>
                {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(ev.date_start).toLocaleDateString('es-AR')}
                  {ev.date_end !== ev.date_start && ` → ${new Date(ev.date_end).toLocaleDateString('es-AR')}`}
                </p>
              </div>
              {isAdmin && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => open(ev)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => delMutation.mutate(ev.id)}>✕</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={close} title={editItem ? 'Editar evento' : 'Nuevo evento'}
        footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>{editItem ? 'Guardar' : 'Crear'}</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Título" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Descripción" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="date" required value={form.date_start} onChange={(e) => setForm((f) => ({ ...f, date_start: e.target.value }))} />
            <Input label="Fecha fin" type="date" required value={form.date_end} onChange={(e) => setForm((f) => ({ ...f, date_end: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="h-9 w-16 rounded border border-slate-200 cursor-pointer" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Tab: Documentos ─────────────────────────────────────────────────────────
function DocumentosTab({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: documentos = [] } = useQuery({
    queryKey: ['documentos'],
    queryFn: () => institutoService.getDocumentos().then((r) => r.data),
  })

  const delMutation = useMutation({
    mutationFn: (id: number) => institutoService.deleteDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documentos'] }),
  })

  const upload = async () => {
    if (!file || !titulo) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', titulo)
    if (categoria) fd.append('category', categoria)
    await institutoService.uploadDocumento(fd)
    qc.invalidateQueries({ queryKey: ['documentos'] })
    setFile(null); setTitulo(''); setCategoria(''); setUploading(false)
  }

  const byCategory = documentos.reduce<Record<string, DocumentoInstituto[]>>((acc, d) => {
    const cat = d.category ?? 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(d)
    return acc
  }, {})

  return (
    <div>
      {isAdmin && (
        <Card className="mb-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Subir documento</p>
          <div className="flex flex-col gap-3">
            <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <Input label="Categoría (opcional)" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Archivo</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>
            <Button onClick={upload} loading={uploading} disabled={!file || !titulo}>Subir</Button>
          </div>
        </Card>
      )}

      {Object.keys(byCategory).length === 0 ? (
        <EmptyState icon="📄" title="Sin documentos" description="No hay documentos publicados." />
      ) : (
        Object.entries(byCategory).map(([cat, docs]) => (
          <div key={cat} className="mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{cat}</p>
            <div className="flex flex-col gap-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                    <p className="text-xs text-slate-400">{new Date(d.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={`/api/documentos/${d.id}/descargar`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="secondary">Descargar</Button>
                    </a>
                    {isAdmin && (
                      <Button size="sm" variant="danger" onClick={() => delMutation.mutate(d.id)}>✕</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Page principal ───────────────────────────────────────────────────────────
export default function InstitutoPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [tab, setTab] = useState<Tab>('info')

  const { data: instituto } = useQuery({
    queryKey: ['instituto'],
    queryFn: () => institutoService.getInstituto().then((r) => r.data),
  })

  return (
    <div>
      <PageHeader title="Instituto" />

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-100 mb-6 -mx-1">
        {TAB_LABELS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${tab === t.key ? 'bg-white border border-slate-100 border-b-white -mb-px text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && instituto && (
        <Card>
          {instituto.logo && (
            <img src={instituto.logo} alt={instituto.name}
              className="h-20 object-contain mb-4" />
          )}
          <h2 className="text-xl font-bold text-slate-900 mb-2">{instituto.name}</h2>
          {instituto.description && (
            <p className="text-sm text-slate-600 whitespace-pre-wrap mb-4 leading-relaxed">{instituto.description}</p>
          )}
          <div className="flex flex-col gap-1.5 text-sm text-slate-500">
            {instituto.address && <p>📍 {instituto.address}</p>}
            {instituto.phone  && <p>📞 {instituto.phone}</p>}
            {instituto.email  && <p>✉️ {instituto.email}</p>}
            {instituto.website && <p>🌐 {instituto.website}</p>}
          </div>
          {isAdmin && (
            <div className="mt-4">
              <Badge variant="warning">Editá la info en Configuración del admin</Badge>
            </div>
          )}
        </Card>
      )}

      {tab === 'noticias'   && <NoticiasList isAdmin={isAdmin} />}
      {tab === 'calendario' && <CalendarioTab isAdmin={isAdmin} />}
      {tab === 'documentos' && <DocumentosTab isAdmin={isAdmin} />}
    </div>
  )
}
