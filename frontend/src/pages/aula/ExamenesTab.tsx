import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, FileQuestion, Plus, Play, CheckCircle2, Settings, BarChart2 } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function ExamenesTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const materiaId = Number(id);

  const { data: examenes = [], isLoading } = useQuery({
    queryKey: ["examenes", materiaId],
    queryFn: () => aulaService.examenes(materiaId),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", descripcion: "", tipo: "examen" as "examen" | "control_lectura",
    fecha_apertura: "", fecha_cierre: "", tiempo_limite_minutos: "60", intentos_permitidos: "1",
  });

  const mutation = useMutation({
    mutationFn: () => aulaService.crearExamen(materiaId, {
      ...form,
      tiempo_limite_minutos: Number(form.tiempo_limite_minutos),
      intentos_permitidos: Number(form.intentos_permitidos),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["examenes", materiaId] });
      toast.success("Examen creado");
      setOpen(false);
      setForm({ title: "", descripcion: "", tipo: "examen", fecha_apertura: "", fecha_cierre: "", tiempo_limite_minutos: "60", intentos_permitidos: "1" });
    },
    onError: () => toast.error("Error al crear el examen"),
  });

  const esDocente = user?.role === "docente" || user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Exámenes y controles</h2>
          <p className="text-sm text-muted-foreground">Evaluaciones del curso</p>
        </div>
        {esDocente && (
          <Button variant="hero" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo examen
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="h-32 bg-secondary rounded-2xl animate-pulse" />
      ) : (examenes as any[]).length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aún no hay exámenes cargados.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
          {(examenes as any[]).map((e) => {
            const abierto = new Date() >= new Date(e.fecha_apertura) && new Date() <= new Date(e.fecha_cierre);
            const intento = e.mis_intentos?.[0] ?? e.miIntento;
            const finalizado = intento && intento.estado !== "en_progreso";

            return (
              <article key={e.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileQuestion className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={e.tipo === "examen" ? "bg-accent/10 text-accent border-accent/20" : "bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20"}>
                    {e.tipo === "examen" ? "Examen" : "Control"}
                  </Badge>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug mb-2">{e.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{e.descripcion}</p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-5 pb-5 border-b border-border">
                  <div>
                    <p className="text-muted-foreground">Duración</p>
                    <p className="font-medium flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />{e.tiempo_limite_minutos} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Intentos</p>
                    <p className="font-medium mt-0.5">{e.intentos_permitidos}</p>
                  </div>
                </div>
                {!esDocente && finalizado && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Completado</span>
                    {intento.nota_final != null && <span className="font-display text-2xl font-semibold">{intento.nota_final}/10</span>}
                  </div>
                )}
                {!esDocente && !finalizado && (
                  <Button variant={abierto ? "hero" : "outline"} disabled={!abierto} className="w-full"
                    onClick={() => abierto && navigate(`/materias/${materiaId}/examenes/${e.id}/tomar`)}>
                    <Play className="h-4 w-4" />
                    {abierto ? "Iniciar examen" : `Abre ${new Date(e.fecha_apertura).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`}
                  </Button>
                )}
                {!esDocente && finalizado && intento?.estado === "en_progreso" && (
                  <Button variant="hero" className="w-full"
                    onClick={() => navigate(`/materias/${materiaId}/examenes/${e.id}/tomar`)}>
                    <Play className="h-4 w-4" /> Continuar
                  </Button>
                )}
                {esDocente && (
                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="flex-1"
                      onClick={() => navigate(`/materias/${materiaId}/examenes/${e.id}/builder`)}>
                      <Settings className="h-3.5 w-3.5" /> Construir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1"
                      onClick={() => navigate(`/materias/${materiaId}/examenes/${e.id}/resultados`)}>
                      <BarChart2 className="h-3.5 w-3.5" /> Resultados ({e.intentos_count ?? 0})
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nuevo examen</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Examen Parcial — Unidad 1" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v: any) => setForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="examen">Examen</SelectItem>
                  <SelectItem value="control_lectura">Control de lectura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Instrucciones..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha apertura</Label>
                <Input type="datetime-local" value={form.fecha_apertura} onChange={e => setForm(f => ({ ...f, fecha_apertura: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Fecha cierre</Label>
                <Input type="datetime-local" value={form.fecha_cierre} onChange={e => setForm(f => ({ ...f, fecha_cierre: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duración (minutos)</Label>
                <Input type="number" min="1" value={form.tiempo_limite_minutos} onChange={e => setForm(f => ({ ...f, tiempo_limite_minutos: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Intentos permitidos</Label>
                <Input type="number" min="1" value={form.intentos_permitidos} onChange={e => setForm(f => ({ ...f, intentos_permitidos: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutation.mutate()} disabled={!form.title || !form.fecha_apertura || !form.fecha_cierre || mutation.isPending}>
                {mutation.isPending ? "Creando..." : "Crear examen"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
