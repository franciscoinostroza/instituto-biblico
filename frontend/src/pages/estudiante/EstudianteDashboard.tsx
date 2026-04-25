import { BookOpen, ClipboardList, Trophy, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { MateriaCard } from "@/components/MateriaCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useMisMaterias } from "@/hooks/useMaterias";

export default function EstudianteDashboard() {
  const { user } = useAuthStore();
  const { data: materias = [], isLoading } = useMisMaterias();
  const pendientes: never[] = [];
  const proximosExamenes: never[] = [];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Mi aula virtual"
        title={`Bienvenido, ${user?.name.split(" ")[0]}`}
        description="Acá tenés tus materias, próximas entregas y exámenes pendientes."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Materias inscriptas" value={materias.length} icon={<BookOpen className="h-5 w-5" />} accent="estudiante" />
        <StatCard label="Tareas pendientes" value={pendientes.length} delta="Próxima en 5 días" icon={<ClipboardList className="h-5 w-5" />} accent="accent" />
        <StatCard label="Promedio general" value="8.4" delta="Sobre 10" icon={<Trophy className="h-5 w-5" />} accent="primary" />
        <StatCard label="Exámenes próximos" value={proximosExamenes.length} icon={<Calendar className="h-5 w-5" />} accent="estudiante" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Próximas entregas */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold">Próximas entregas</h2>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">{pendientes.length} pendientes</Badge>
          </div>
          <div className="space-y-3">
            {pendientes.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No tenés entregas pendientes 🎉</p>
            )}
            {pendientes.map((t) => {
              const dias = Math.ceil((new Date(t.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <Link key={t.id} to={`/materias/${t.materia_id}/tareas`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary transition-smooth group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg font-display font-semibold leading-none">{dias}</span>
                        <span className="text-[9px] uppercase tracking-wider">días</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Antiguo Testamento I · {t.puntaje_maximo} pts</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-smooth" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Próximos exámenes */}
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
          <h2 className="font-display text-xl font-semibold mb-5">Exámenes</h2>
          <div className="space-y-3">
            {proximosExamenes.map((e) => (
              <div key={e.id} className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1">{e.tipo === "examen" ? "Examen" : "Control de lectura"}</p>
                <p className="font-medium leading-snug">{e.title}</p>
                <p className="text-xs opacity-80 mt-2">
                  {new Date(e.fecha_apertura).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · {e.tiempo_limite_minutos} min
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
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
            {materias.map((m) => <MateriaCard key={m.id} materia={m} variant="estudiante" />)}
          </div>
        )}
      </section>
    </div>
  );
}
