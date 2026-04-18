import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageHeader, Button, Textarea, Alert, Card } from '@/components/ui'
import type { Materia } from '@/types'

interface Props { materia?: Materia }

export default function PlanCursoPage({ materia }: Props) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isDocente = user?.role !== 'estudiante'
  const mid = materia?.id
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ content: '', objetivos: '', bibliografia: '' })
  const [saved, setSaved]     = useState(false)

  const { data: plan } = useQuery({
    queryKey: ['plan-curso', mid],
    queryFn: () => materiaService.getPlanDeCurso(mid!).then((r) => r.data),
    enabled: !!mid,
  })

  useEffect(() => {
    if (plan) setForm({ content: plan.content ?? '', objetivos: plan.objetivos ?? '', bibliografia: plan.bibliografia ?? '' })
  }, [plan])

  const saveMutation = useMutation({
    mutationFn: () => materiaService.updatePlanDeCurso(mid!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plan-curso', mid] }); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  return (
    <div>
      <PageHeader title="Plan de curso" description="Objetivos, contenidos y bibliografía"
        action={isDocente && !editing ? <Button onClick={() => setEditing(true)}>Editar plan</Button> : undefined} />

      {saved && <Alert variant="success" className="mb-4">Plan guardado correctamente.</Alert>}

      {editing ? (
        <div className="flex flex-col gap-5">
          <Textarea label="Contenido del curso" rows={10} value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            hint="Podés usar Markdown para dar formato al contenido." />
          <Textarea label="Objetivos" rows={5} value={form.objetivos}
            onChange={(e) => setForm((f) => ({ ...f, objetivos: e.target.value }))} />
          <Textarea label="Bibliografía" rows={5} value={form.bibliografia}
            onChange={(e) => setForm((f) => ({ ...f, bibliografia: e.target.value }))} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Guardar plan</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {!plan?.content && !plan?.objetivos && !plan?.bibliografia ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium text-slate-600">Sin plan de curso</p>
              {isDocente && <p className="text-sm mt-1">Hacé click en "Editar plan" para comenzar.</p>}
            </div>
          ) : (
            <>
              {plan?.content && (
                <Card>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">📚 Contenido del curso</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{plan.content}</p>
                </Card>
              )}
              {plan?.objetivos && (
                <Card>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">🎯 Objetivos</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{plan.objetivos}</p>
                </Card>
              )}
              {plan?.bibliografia && (
                <Card>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">📖 Bibliografía</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{plan.bibliografia}</p>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
