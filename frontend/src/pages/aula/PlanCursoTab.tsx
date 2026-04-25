import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Edit3, Target, BookOpen, FileText } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function PlanCursoTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan", id],
    queryFn: () => aulaService.planCurso(Number(id)),
  });
  const puedeEditar = user?.role === "docente" || user?.role === "admin";

  if (isLoading) return <div className="h-64 bg-secondary rounded-2xl animate-pulse" />;
  if (!plan) return <p className="text-muted-foreground">Plan de curso aún no definido.</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Plan de curso</h2>
          <p className="text-sm text-muted-foreground">Última actualización: {new Date(plan.updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        {puedeEditar && <Button variant="outline"><Edit3 className="h-4 w-4" /> Editar plan</Button>}
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-semibold">Descripción</h3>
          </div>
          <p className="text-foreground leading-relaxed whitespace-pre-line">{plan.content}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-semibold">Objetivos</h3>
          </div>
          <p className="text-foreground leading-relaxed whitespace-pre-line">{plan.objetivos}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-role-estudiante/10 text-role-estudiante flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-semibold">Bibliografía</h3>
          </div>
          <p className="text-foreground leading-relaxed whitespace-pre-line">{plan.bibliografia}</p>
        </section>
      </div>
    </div>
  );
}
