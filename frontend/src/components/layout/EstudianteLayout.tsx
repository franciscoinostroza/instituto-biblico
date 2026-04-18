import { useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar, type NavItem } from './Sidebar'
import { Navbar } from './Navbar'
import { PageSpinner } from '@/components/ui'

const MateriasPage  = lazy(() => import('@/pages/estudiante/MateriasPage'))
const AulaLayout    = lazy(() => import('./AulaLayout'))
const InstitutoPage = lazy(() => import('@/pages/shared/InstitutoPage'))
const MensajesPage  = lazy(() => import('@/pages/shared/MensajesPage'))
const PerfilPage    = lazy(() => import('@/pages/shared/PerfilPage'))

const NAV_ITEMS: NavItem[] = [
  { to: '/materias', label: 'Mis Materias', icon: '📖', end: true },
  { to: '/instituto', label: 'Instituto',   icon: '🏛️' },
  { to: '/mensajes',  label: 'Mensajes',    icon: '💬' },
]

export default function EstudianteLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        items={NAV_ITEMS}
        accentClass="text-green-300"
        role="estudiante"
        roleLabel="Estudiante"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-5">
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route path="materias"        element={<MateriasPage />} />
              <Route path="materias/:id/*"  element={<AulaLayout />} />
              <Route path="instituto"       element={<InstitutoPage />} />
              <Route path="mensajes"        element={<MensajesPage />} />
              <Route path="mensajes/:id"    element={<MensajesPage />} />
              <Route path="perfil"          element={<PerfilPage />} />
              <Route path="*"              element={<Navigate to="/materias" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
