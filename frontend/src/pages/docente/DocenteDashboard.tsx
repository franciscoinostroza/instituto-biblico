import { BookOpen, Users, ClipboardCheck, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { MateriaCard } from "@/components/MateriaCard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMisMaterias } from "@/hooks/useMaterias";

export default function DocenteDashboard() {
  const { user } = useAuthStore();
  const { data: materias = [], isLoading } = useMisMaterias();
  const pendientes: never[] = [];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Panel docente"
        title={`Hola, ${user?.name.split(" ")[1] ?? user?.name}`}
        description="Gestioná tus cursos, calificá entregas y mantenete cerca de tus estudiantes."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Materias asignadas" value={materias.length} icon={<BookOpen className="h-5 w-5" />} accent="primary" />
        <StatCard label="Total estudiantes" value={materias.reduce((a, m) => a + (m.totalEstudiantes ?? 0), 0)} icon={<Users className="h-5 w-5" />} accent="accent" />
        <StatCard label="Por calificar" value={pendientes.reduce((a, t) => a + (t.totalEntregas ?? 0), 0)} delta="Tareas entregadas" icon={<ClipboardCheck className="h-5 w-5" />} accent="estudiante" />
        <StatCard label="Mensajes nuevos" value={3} icon={<MessageSquare className="h-5 w-5" />} accent="accent" />
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-semibold">Mis materias</h2>
            <p className="text-sm text-muted-foreground">Período lectivo actual</p>
          </div>
          <Button variant="ghost" asChild><Link to="/materias">Ver todas <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {materias.map((m) => <MateriaCard key={m.id} materia={m} variant="docente" />)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold mb-5">Por calificar</h2>
        <div className="space-y-3">
          {pendientes.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary transition-smooth">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.totalEntregas} entregas de {t.totalEsperadas} estudiantes</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/materias/${t.materia_id}/tareas`}>Calificar</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
