import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Target, BookOpen, FileText } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function PlanCursoTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan", materiaId],
    queryFn: () => aulaService.planCurso(materiaId),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ content: "", objetivos: "", bibliografia: "" });

  useEffect(() => {
    if (plan && open) {
      setForm({ content: plan.content ?? "", objetivos: plan.objetivos ?? "", bibliografia: plan.bibliografia ?? "" });
    }
  }, [plan, open]);

  const mutation = useMutation({
    mutationFn: () => aulaService.actualizarPlanCurso(materiaId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan", materiaId] });
      toast.success("Plan de curso actualizado");
      setOpen(false);
    },
    onError: () => toast.error("Error al actualizar el plan"),
  });

  const puedeEditar = user?.role === "docente" || user?.role === "admin";

  if (isLoading) return <div className="h-64 bg-secondary rounded-2xl animate-pulse" />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Plan de curso</h2>
          {plan?.updated_at && (
            <p className="text-sm text-muted-foreground">Actualizado: {new Date(plan.updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
          )}
        </div>
        {puedeEditar && (
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Edit3 className="h-4 w-4" /> {plan ? "Editar plan" : "Crear plan"}
          </Button>
        )}
      </div>

      {!plan?.content && !plan?.objetivos ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">El plan de curso aún no está definido.</p>
          {puedeEditar && <Button variant="hero" className="mt-4" onClick={() => setOpen(true)}>Crear plan de curso</Button>}
        </div>
      ) : (
        <div className="space-y-6">
          {plan.content && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                <h3 className="font-display text-lg font-semibold">Descripción</h3>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{plan.content}</p>
            </section>
          )}
          {plan.objetivos && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><Target className="h-4 w-4" /></div>
                <h3 className="font-display text-lg font-semibold">Objetivos</h3>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{plan.objetivos}</p>
            </section>
          )}
          {plan.bibliografia && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-role-estudiante/10 text-role-estudiante flex items-center justify-center"><BookOpen className="h-4 w-4" /></div>
                <h3 className="font-display text-lg font-semibold">Bibliografía</h3>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{plan.bibliografia}</p>
            </section>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{plan ? "Editar plan de curso" : "Crear plan de curso"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Descripción del curso</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Descripción general del curso..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Objetivos</Label>
              <Textarea value={form.objetivos} onChange={e => setForm(f => ({ ...f, objetivos: e.target.value }))} placeholder="Objetivos de aprendizaje..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Bibliografía</Label>
              <Textarea value={form.bibliografia} onChange={e => setForm(f => ({ ...f, bibliografia: e.target.value }))} placeholder="Bibliografía recomendada..." rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
