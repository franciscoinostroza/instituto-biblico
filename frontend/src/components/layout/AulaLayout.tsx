import { useState, lazy, Suspense } from 'react'
import { Routes, Route, NavLink, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { materiaService } from '@/services/materiaService'
import { useAuthStore } from '@/store/authStore'
import { PageSpinner, Badge } from '@/components/ui'
import type { Materia } from '@/types'

// Páginas del aula
const AnunciosPage   = lazy(() => import('@/pages/shared/aula/AnunciosPage'))
const RecursosPage   = lazy(() => import('@/pages/shared/aula/RecursosPage'))
const PlanCursoPage  = lazy(() => import('@/pages/shared/aula/PlanCursoPage'))
const TareasPage     = lazy(() => import('@/pages/shared/aula/TareasPage'))
const TareaDetalle   = lazy(() => import('@/pages/shared/aula/TareaDetalle'))
const ExamenesPage   = lazy(() => import('@/pages/shared/aula/ExamenesPage'))
const ExamenDetalle  = lazy(() => import('@/pages/shared/aula/ExamenDetalle'))
const NotasPage      = lazy(() => import('@/pages/shared/aula/NotasPage'))

interface NavSection {
  to: string
  label: string
  icon: string
}

const NAV_SECTIONS: NavSection[] = [
  { to: 'anuncios',     label: 'Anuncios',      icon: '📢' },
  { to: 'recursos',     label: 'Recursos',       icon: '📁' },
  { to: 'plan-de-curso', label: 'Plan de curso', icon: '📋' },
  { to: 'tareas',       label: 'Tareas',         icon: '✏️' },
  { to: 'examenes',     label: 'Exámenes',       icon: '📝' },
  { to: 'notas',        label: 'Calificaciones', icon: '⭐' },
]

export default function AulaLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: materia, isLoading } = useQuery({
    queryKey: ['materia', id],
    queryFn: () => materiaService.getMateria(Number(id)).then((r) => r.data),
    enabled: !!id,
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="-m-5 flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar del aula */}
      <aside className={clsx(
        'fixed top-14 left-0 h-full w-60 bg-white border-r border-slate-100 flex flex-col z-30 transition-transform duration-300',
        'lg:relative lg:top-0 lg:translate-x-0 lg:flex-shrink-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Header de la materia */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => navigate('/materias')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-600 mb-3 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mis materias
          </button>
          <h2 className="text-sm font-semibold text-slate-900 leading-tight">{materia?.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{materia?.code}</p>
          {materia?.docente && (
            <p className="text-xs text-slate-400 mt-1">Prof. {materia.docente.name}</p>
          )}
          {user?.role && (
            <div className="mt-2">
              <Badge variant={user.role === 'docente' ? 'primary' : 'success'}>
                {user.role === 'docente' ? 'Docente' : 'Estudiante'}
              </Badge>
            </div>
          )}
        </div>

        {/* Nav del aula */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="flex flex-col gap-0.5">
            {NAV_SECTIONS.map((section) => (
              <li key={section.to}>
                <NavLink
                  to={section.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <span className="w-4 text-center">{section.icon}</span>
                  {section.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Contenido del aula */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil del aula */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-700 truncate">{materia?.name}</span>
        </div>

        <main className="flex-1 overflow-y-auto p-5">
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route index element={<AnunciosPage materia={materia} />} />
              <Route path="anuncios"      element={<AnunciosPage materia={materia} />} />
              <Route path="recursos"      element={<RecursosPage materia={materia} />} />
              <Route path="plan-de-curso" element={<PlanCursoPage materia={materia} />} />
              <Route path="tareas"        element={<TareasPage materia={materia} />} />
              <Route path="tareas/:tareaId" element={<TareaDetalle materia={materia} />} />
              <Route path="examenes"      element={<ExamenesPage materia={materia} />} />
              <Route path="examenes/:examenId" element={<ExamenDetalle materia={materia} />} />
              <Route path="notas"         element={<NotasPage materia={materia} />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
