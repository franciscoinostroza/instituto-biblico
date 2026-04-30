import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, ClipboardList, FileQuestion, Award, Users } from "lucide-react";
import { useMateria } from "@/hooks/useMaterias";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "inicio", label: "Inicio", icon: LayoutDashboard },
  { to: "tareas", label: "Tareas", icon: ClipboardList },
  { to: "examenes", label: "Exámenes", icon: FileQuestion },
  { to: "notas", label: "Notas", icon: Award },
];

export default function AulaLayout() {
  const { id } = useParams();
  const materiaId = Number(id);
  const { data: materia, isLoading } = useMateria(materiaId);
  const { user } = useAuthStore();

  if (isLoading) {
    return <div className="container mx-auto p-8"><div className="h-32 bg-secondary rounded-2xl animate-pulse" /></div>;
  }
  if (!materia) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Materia no encontrada</div>;
  }

  return (
    <div>
      {/* Hero de la materia */}
      <div className={cn("relative overflow-hidden bg-gradient-to-br", materia.color ?? "from-primary to-primary-glow")}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 15% 50%, white 1px, transparent 1px), radial-gradient(circle at 85% 30%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 text-primary-foreground">
          <Link to="/materias" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-smooth mb-4">
            <ArrowLeft className="h-4 w-4" /> Volver a materias
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">
            {materia.code} · {typeof materia.carrera === "string" ? materia.carrera : (materia.carrera as any)?.name}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight max-w-3xl">{materia.name}</h1>
          {materia.description && <p className="mt-3 max-w-2xl opacity-85">{materia.description}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm opacity-85">
            {materia.docente && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" /> {materia.docente.name}
              </div>
            )}
            {materia.totalEstudiantes && (
              <div className="flex items-center gap-2">
                <span className="opacity-60">·</span> {materia.totalEstudiantes} estudiantes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs sticky */}
      <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((t) => (
              <NavLink
                key={t.to} to={t.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-smooth",
                    isActive
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet context={{ materia, user }} />
      </div>
    </div>
  );
}
