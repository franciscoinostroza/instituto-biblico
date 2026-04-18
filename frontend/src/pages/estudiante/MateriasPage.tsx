import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { materiaService } from '@/services/materiaService'
import { PageHeader, Badge, Card, EmptyState } from '@/components/ui'
import type { Materia } from '@/types'

function MateriaCard({ materia, onClick }: { materia: Materia; onClick: () => void }) {
  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-900 leading-tight">{materia.name}</p>
          <Badge variant="slate" className="flex-shrink-0">{materia.code}</Badge>
        </div>
        {materia.docente && (
          <p className="text-xs text-slate-500">Prof. {materia.docente.name}</p>
        )}
        {materia.carrera && (
          <p className="text-xs text-slate-400">{materia.carrera.name}</p>
        )}
        {materia.periodo && (
          <p className="text-xs text-slate-400">
            {materia.periodo.name} · {materia.periodo.year}
          </p>
        )}
        {materia.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{materia.description}</p>
        )}
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
      <PageHeader title="Mis materias" description="Materias en las que estás inscripto" />

      {materias.length === 0 ? (
        <EmptyState icon="📖" title="Sin materias inscriptas"
          description="El administrador aún no te inscribió en ninguna materia." />
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
