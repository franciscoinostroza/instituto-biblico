import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { queryClient } from '@/services/queryClient'
import { useAuthStore } from '@/store/authStore'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Rutas protegidas (lazy para performance)
import { lazy, Suspense } from 'react'

const AdminLayout      = lazy(() => import('@/components/layout/AdminLayout'))
const DocenteLayout    = lazy(() => import('@/components/layout/DocenteLayout'))
const EstudianteLayout = lazy(() => import('@/components/layout/EstudianteLayout'))

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-primary-600">Cargando...</div>}>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        {/* Redirect según rol */}
        <Route
          path="/dashboard"
          element={
            user?.role === 'admin' ? <Navigate to="/admin/usuarios" replace /> :
            user?.role === 'docente' ? <Navigate to="/materias" replace /> :
            <Navigate to="/materias" replace />
          }
        />

        {/* Admin */}
        {user?.role === 'admin' && (
          <Route path="/*" element={<AdminLayout />} />
        )}

        {/* Docente */}
        {user?.role === 'docente' && (
          <Route path="/*" element={<DocenteLayout />} />
        )}

        {/* Estudiante */}
        {user?.role === 'estudiante' && (
          <Route path="/*" element={<EstudianteLayout />} />
        )}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
