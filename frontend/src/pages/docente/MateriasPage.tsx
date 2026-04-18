import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { materiaService } from '@/services/materiaService'
import { PageHeader, Badge, Card, EmptyState } from '@/components/ui'
import type { Materia } from '@/types'

function MateriaCard({ materia, onClick }: { materia: Materia; onClick: () => void }) {
  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-slate-900">{materia.name}</p>
            <Badge variant="slate">{materia.code}</Badge>
            {!materia.active && <Badge variant="danger">Inactiva</Badge>}
          </div>
          {materia.carrera && (
            <p className="text-xs text-slate-500">{materia.carrera.name}</p>
          )}
          {materia.periodo && (
            <p className="text-xs text-slate-400 mt-0.5">
              {materia.periodo.name} · {materia.periodo.year}
            </p>
          )}
          {materia.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{materia.description}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold text-primary-600">{materia.inscripciones_count ?? 0}</p>
          <p className="text-xs text-slate-400">estudiantes</p>
        </div>
      </div>
    </Card>
  )
}

export default function MateriasPage() {
  const navigate = useNavigate()
  const { data: materias = [], isLoading } = useQuery({
    queryKey: ['materias'],
    queryFn: () => materiaService.getMaterias().then((r) => r.data),
  })

  if (isLoading) return <div className="text-slate-400 py-10 text-center">Cargando...</div>

  return (
    <div>
      <PageHeader title="Mis materias" description="Materias que tenés asignadas este período" />

      {materias.length === 0 ? (
        <EmptyState icon="📚" title="Sin materias asignadas"
          description="El administrador aún no te asignó materias." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {materias.map((m) => (
            <MateriaCard key={m.id} materia={m}
              onClick={() => navigate(`/materias/${m.id}/anuncios`)} />
          ))}
        </div>
      )}
    </div>
  )
}
