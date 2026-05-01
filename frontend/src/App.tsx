import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "@/pages/auth/Login";
import DashboardRedirect from "@/pages/DashboardRedirect";
import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsuarios from "@/pages/admin/AdminUsuarios";
import AdminCarreras from "@/pages/admin/AdminCarreras";
import AdminMaterias from "@/pages/admin/AdminMaterias";

import DocenteDashboard from "@/pages/docente/DocenteDashboard";
import EstudianteDashboard from "@/pages/estudiante/EstudianteDashboard";
import MateriasIndex from "@/pages/MateriasIndex";

import AulaLayout from "@/pages/aula/AulaLayout";
import AulaLandingTab from "@/pages/aula/AulaLandingTab";
import TareasTab from "@/pages/aula/TareasTab";
import ExamenesTab from "@/pages/aula/ExamenesTab";
import NotasTab from "@/pages/aula/NotasTab";
import AsistenciaTab from "@/pages/aula/AsistenciaTab";

import { PlaceholderPage } from "@/pages/PlaceholderPage";
import InstitutoPage from "@/pages/InstitutoPage";
import PerfilPage from "@/pages/PerfilPage";
import MensajesPage from "@/pages/MensajesPage";
import ExamenBuilder from "@/pages/aula/ExamenBuilder";
import ExamenTomar from "@/pages/aula/ExamenTomar";
import ExamenResultados from "@/pages/aula/ExamenResultados";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/docente/dashboard" element={<DocenteDashboard />} />
              <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />

              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/carreras" element={<AdminCarreras />} />
              <Route path="/admin/materias" element={<AdminMaterias />} />
              <Route path="/admin/reportes" element={<PlaceholderPage eyebrow="Análisis" title="Reportes" description="Estadísticas globales del instituto." />} />
              <Route path="/admin/configuracion" element={<PlaceholderPage eyebrow="Sistema" title="Configuración" description="Información institucional y ajustes generales." />} />

              <Route path="/materias" element={<MateriasIndex />} />

              <Route path="/materias/:id" element={<AulaLayout />}>
                <Route index element={<Navigate to="inicio" replace />} />
                <Route path="inicio" element={<AulaLandingTab />} />
                <Route path="tareas" element={<TareasTab />} />
                <Route path="examenes" element={<ExamenesTab />} />
                <Route path="asistencia" element={<AsistenciaTab />} />
                <Route path="notas" element={<NotasTab />} />
              </Route>

              <Route path="/materias/:id/examenes/:examenId/builder" element={<ExamenBuilder />} />
              <Route path="/materias/:id/examenes/:examenId/tomar" element={<ExamenTomar />} />
              <Route path="/materias/:id/examenes/:examenId/resultados" element={<ExamenResultados />} />

              <Route path="/instituto" element={<InstitutoPage />} />
              <Route path="/mensajes" element={<MensajesPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
