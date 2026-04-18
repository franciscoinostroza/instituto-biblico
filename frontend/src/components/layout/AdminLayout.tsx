import { useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar, type NavItem } from './Sidebar'
import { Navbar } from './Navbar'
import { PageSpinner } from '@/components/ui'

const AdminUsuarios     = lazy(() => import('@/pages/admin/AdminUsuarios'))
const AdminCarreras     = lazy(() => import('@/pages/admin/AdminCarreras'))
const AdminMaterias     = lazy(() => import('@/pages/admin/AdminMaterias'))
const AdminConfiguracion = lazy(() => import('@/pages/admin/AdminConfiguracion'))
const InstitutoPage     = lazy(() => import('@/pages/shared/InstitutoPage'))
const MensajesPage      = lazy(() => import('@/pages/shared/MensajesPage'))
const PerfilPage        = lazy(() => import('@/pages/shared/PerfilPage'))

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/usuarios',      label: 'Usuarios',     icon: '👥' },
  { to: '/admin/carreras',      label: 'Carreras',     icon: '🎓' },
  { to: '/admin/materias',      label: 'Materias',     icon: '📚' },
  { to: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
  { to: '/instituto',           label: 'Instituto',    icon: '🏛️' },
  { to: '/mensajes',            label: 'Mensajes',     icon: '💬' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        items={NAV_ITEMS}
        accentClass="text-gold-400"
        role="admin"
        roleLabel="Administración"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-5">
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route path="admin/usuarios"       element={<AdminUsuarios />} />
              <Route path="admin/carreras"       element={<AdminCarreras />} />
              <Route path="admin/materias"       element={<AdminMaterias />} />
              <Route path="admin/configuracion"  element={<AdminConfiguracion />} />
              <Route path="instituto"            element={<InstitutoPage />} />
              <Route path="mensajes"             element={<MensajesPage />} />
              <Route path="mensajes/:id"         element={<MensajesPage />} />
              <Route path="perfil"               element={<PerfilPage />} />
              <Route path="*"                    element={<Navigate to="/admin/usuarios" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
