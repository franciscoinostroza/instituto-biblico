import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Modal, Input, Select, Alert, Badge, Card, EmptyState } from '@/components/ui'
import type { Materia, FilaLibroCalificaciones, Nota, TipoNota } from '@/types'

interface Props { materia?: Materia }

const TIPO_LABEL: Record<TipoNota, string> = {
  tarea: 'Tarea', examen: 'Examen', control_lectura: 'Control',
  parcial: 'Parcial', final: 'Final', adicional: 'Adicional',
}

const TIPOS_TABLA: TipoNota[] = ['tarea', 'examen', 'control_lectura', 'parcial', 'final', 'adicional']
const TIPOS_MANUAL: TipoNota[] = ['parcial', 'final', 'adicional']

function promPct(notas: Nota[]) {
  if (!notas.length) return null
  const sum = notas.reduce((acc, n) => acc + (n.nota / n.puntaje_maximo) * 100, 0)
  return Math.round(sum / notas.length)
}

export default function NotasPage({ materia }: Props) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id

  const [modalOpen, setModal] = useState(false)
  const [selectedEst, setEst] = useState<FilaLibroCalificaciones['estudiante'] | null>(null)
  const [form, setForm] = useState({ tipo: 'adicional' as TipoNota, nota: '', puntaje_maximo: '100', descripcion: '' })
  const [formErr, setFormErr] = useState<string | null>(null)

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['notas', mid],
    queryFn: () => materiaService.getNotas(mid!).then((r) => r.data),
    enabled: !!mid,
  })

  const saveMutation = useMutation({
    mutationFn: () => materiaService.createNota(mid!, {
      estudiante_id: selectedEst!.id,
      tipo: form.tipo,
      nota: Number(form.nota),
      puntaje_maximo: Number(form.puntaje_maximo),
      descripcion: form.descripcion || undefined,
    } as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notas', mid] }); closeModal() },
    onError: (e: any) => setFormErr(e?.response?.data?.message ?? 'Error.'),
  })

  const openModal = (est: FilaLibroCalificaciones['estudiante']) => {
    setEst(est)
    setForm({ tipo: 'adicional', nota: '', puntaje_maximo: '100', descripcion: '' })
    setFormErr(null); setModal(true)
  }
  const closeModal = () => { setModal(false); setEst(null); setFormErr(null) }

  if (isLoading) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  // ── Vista Estudiante ──────────────────────────────────────────────────────────
  if (!isDocente) {
    const misNotas = (rawData as Nota[]) ?? []
    return (
      <div>
        <PageHeader title="Mis calificaciones" description="Notas registradas en esta materia" />
        {misNotas.length === 0 ? (
          <EmptyState icon="📊" title="Sin calificaciones" description="Aún no tenés notas registradas." />
        ) : (
          <div className="flex flex-col gap-3">
            {misNotas.map((n) => (
              <Card key={n.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {TIPO_LABEL[n.tipo]}{n.descripcion ? ` — ${n.descripcion}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-xl text-slate-900">{n.nota}</p>
                    <p className="text-xs text-slate-400">/ {n.puntaje_maximo}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Vista Docente — Libro de calificaciones ───────────────────────────────────
  const libro = (rawData as FilaLibroCalificaciones[]) ?? []

  return (
    <div>
      <PageHeader
        title="Libro de calificaciones"
        description={`${libro.length} estudiante${libro.length !== 1 ? 's' : ''}`}
      />

      {libro.length === 0 ? (
        <EmptyState icon="📊" title="Sin estudiantes" description="No hay estudiantes inscriptos aún." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Estudiante</th>
                {TIPOS_TABLA.map((t) => (
                  <th key={t} className="text-center px-3 py-3 font-semibold whitespace-nowrap">
                    {TIPO_LABEL[t]}
                  </th>
                ))}
                <th className="text-center px-3 py-3 font-semibold whitespace-nowrap">Promedio</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {libro.map((fila) => {
                const byTipo = (tipo: TipoNota) => fila.notas.filter((n) => n.tipo === tipo)
                const pct = promPct(fila.notas)
                return (
                  <tr key={fila.estudiante.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-slate-900">{fila.estudiante.name}</p>
                      <p className="text-xs text-slate-400">{fila.estudiante.email}</p>
                    </td>
                    {TIPOS_TABLA.map((tipo) => {
                      const ns = byTipo(tipo)
                      const avg = ns.length
                        ? Math.round(ns.reduce((a, n) => a + n.nota, 0) / ns.length * 10) / 10
                        : null
                      return (
                        <td key={tipo} className="px-3 py-3 text-center">
                          {avg !== null
                            ? <span className="font-semibold text-slate-700">{avg}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                      )
                    })}
                    <td className="px-3 py-3 text-center">
                      {pct !== null ? (
                        <Badge variant={pct >= 60 ? 'success' : 'danger'}>{pct}%</Badge>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Button size="sm" variant="ghost" onClick={() => openModal(fila.estudiante)}>
                        + Nota
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal}
        title={`Agregar nota — ${selectedEst?.name}`} size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              Guardar
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          {formErr && <Alert variant="danger">{formErr}</Alert>}
          <Select label="Tipo" value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoNota }))}>
            {TIPOS_MANUAL.map((t) => (
              <option key={t} value={t}>{TIPO_LABEL[t]}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nota" type="number" required value={form.nota}
              onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))} />
            <Input label="Puntaje máximo" type="number" value={form.puntaje_maximo}
              onChange={(e) => setForm((f) => ({ ...f, puntaje_maximo: e.target.value }))} />
          </div>
          <Input label="Descripción (opcional)" value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
