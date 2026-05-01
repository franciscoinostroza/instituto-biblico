import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, HelpCircle, Plus, Upload, Users } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function TareasTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const { data: tareas = [], isLoading } = useQuery({
    queryKey: ["tareas", materiaId],
    queryFn: () => aulaService.tareas(materiaId),
  });

  // Dialog crear tarea (docente)
  const [openCrear, setOpenCrear] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", fecha_limite: "", puntaje_maximo: "10", permite_entrega_tardia: false, peso_porcentaje: "" });

  // Dialog entregas docente
  const [tareaEntregas, setTareaEntregas] = useState<any>(null);
  const [calificando, setCalificando] = useState<Record<number, { nota: string; comentario: string }>>({});

  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ["entregas", materiaId, tareaEntregas?.id],
    queryFn: () => aulaService.listarEntregas(materiaId, tareaEntregas.id),
    enabled: !!tareaEntregas,
  });

  const mutCalificar = useMutation({
    mutationFn: ({ entregaId, nota, comentario_docente }: { entregaId: number; nota: number; comentario_docente?: string }) =>
      aulaService.calificarEntrega(materiaId, tareaEntregas.id, entregaId, { nota, comentario_docente }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entregas", materiaId, tareaEntregas?.id] });
      qc.invalidateQueries({ queryKey: ["tareas", materiaId] });
      toast.success("Calificación guardada");
    },
    onError: () => toast.error("Error al calificar"),
  });

  // Dialog entregar (estudiante)
  const [tareaEntregar, setTareaEntregar] = useState<any>(null);
  const [comentario, setComentario] = useState("");
  const [fileEntrega, setFileEntrega] = useState<File | null>(null);

  const mutCrear = useMutation({
    mutationFn: () => aulaService.crearTarea(materiaId, {
      ...form,
      puntaje_maximo: Number(form.puntaje_maximo),
      peso_porcentaje: form.peso_porcentaje !== "" ? Number(form.peso_porcentaje) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tareas", materiaId] });
      toast.success("Tarea creada");
      setOpenCrear(false);
      setForm({ title: "", description: "", fecha_limite: "", puntaje_maximo: "10", permite_entrega_tardia: false, peso_porcentaje: "" });
    },
    onError: () => toast.error("Error al crear la tarea"),
  });

  const mutEntregar = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (comentario) fd.append("comentario_alumno", comentario);
      if (fileEntrega) fd.append("file", fileEntrega);
      return aulaService.entregarTarea(materiaId, tareaEntregar.id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tareas", materiaId] });
      toast.success("Tarea entregada");
      setTareaEntregar(null);
      setComentario("");
      setFileEntrega(null);
    },
    onError: () => toast.error("Error al entregar la tarea"),
  });

  const esDocente = user?.role === "docente" || user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Tareas</h2>
          <p className="text-sm text-muted-foreground">{(tareas as any[]).length} actividades del curso</p>
        </div>
        {esDocente && (
          <Button variant="hero" onClick={() => setOpenCrear(true)}>
            <Plus className="h-4 w-4" /> Nueva tarea
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="h-32 bg-secondary rounded-2xl animate-pulse" />
      ) : (tareas as any[]).length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <p className="text-muted-foreground">Aún no hay tareas cargadas.</p>
        </div>
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {(tareas as any[]).map((t) => {
            const ms = new Date(t.fecha_limite).getTime() - Date.now();
            const dias = Math.ceil(ms / (1000 * 60 * 60 * 24));
            const vencida = ms < 0;
            const entrega = t.mi_entrega ?? t.miEntrega;
            const entregada = !!entrega;
            const calificada = entrega?.nota != null;

            return (
              <article key={t.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="flex sm:flex-col items-center gap-2 sm:w-20 shrink-0">
                    <div className="text-center px-3 py-2 rounded-xl bg-secondary">
                      <p className="font-display text-2xl font-semibold leading-none text-foreground">{new Date(t.fecha_limite).getDate()}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{new Date(t.fecha_limite).toLocaleDateString("es-AR", { month: "short" })}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold leading-snug">{t.title}</h3>
                      <div className="flex items-center gap-2">
                        {!esDocente && calificada && <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10"><CheckCircle2 className="h-3 w-3 mr-1" />{entrega.nota}/{t.puntaje_maximo}</Badge>}
                        {!esDocente && entregada && !calificada && <Badge className="bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20 hover:bg-role-estudiante/10">Entregada</Badge>}
                        {!esDocente && !entregada && !vencida && <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/10"><Clock className="h-3 w-3 mr-1" />{dias} días</Badge>}
                        {!esDocente && !entregada && vencida && <Badge variant="destructive">Vencida</Badge>}
                        {esDocente && (
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => { setTareaEntregas(t); setCalificando({}); }}
                          >
                            <Users className="h-3 w-3 mr-1" />{t.entregas_count ?? t.totalEntregas ?? 0} entregadas
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />Vence {new Date(t.fecha_limite).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}</span>
                      <span>Puntaje: {t.puntaje_maximo} pts</span>
                      {t.permite_entrega_tardia && <span className="text-accent">Acepta tardías</span>}
                      {t.peso_porcentaje > 0 && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-[10px] px-1.5 py-0">{t.peso_porcentaje}% nota final</Badge>
                      )}
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      {!esDocente && !entregada && (
                        <Button variant="hero" size="sm" disabled={vencida && !t.permite_entrega_tardia} onClick={() => setTareaEntregar(t)}>
                          <Upload className="h-3.5 w-3.5" /> Entregar tarea
                        </Button>
                      )}
                      {!esDocente && entregada && (
                        <p className="text-xs text-success flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />{calificada ? `Calificada: ${entrega.nota}/${t.puntaje_maximo}` : "Entregada — pendiente de calificación"}</p>
                      )}
                      {esDocente && (
                        <Button variant="outline" size="sm" onClick={() => { setTareaEntregas(t); setCalificando({}); }}>
                          <Users className="h-3.5 w-3.5" /> Ver entregas
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Dialog nueva tarea */}
      <Dialog open={openCrear} onOpenChange={setOpenCrear}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nombre de la tarea" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Instrucciones para los estudiantes..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha límite</Label>
                <Input type="datetime-local" value={form.fecha_limite} onChange={e => setForm(f => ({ ...f, fecha_limite: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Puntaje máximo</Label>
                <Input type="number" min="1" value={form.puntaje_maximo} onChange={e => setForm(f => ({ ...f, puntaje_maximo: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="peso_tarea">Peso en nota final (%)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Porcentaje que representa esta tarea en la calificación final</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="peso_tarea"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.peso_porcentaje}
                onChange={e => setForm(f => ({ ...f, peso_porcentaje: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.permite_entrega_tardia} onChange={e => setForm(f => ({ ...f, permite_entrega_tardia: e.target.checked }))} className="rounded" />
              Permitir entrega tardía
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenCrear(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutCrear.mutate()} disabled={!form.title || !form.fecha_limite || mutCrear.isPending}>
                {mutCrear.isPending ? "Creando..." : "Crear tarea"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ver entregas (docente) */}
      <Dialog open={!!tareaEntregas} onOpenChange={v => { if (!v) setTareaEntregas(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entregas: {tareaEntregas?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {loadingEntregas ? (
              <div className="h-20 bg-secondary rounded-xl animate-pulse" />
            ) : (entregas as any[]).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Ningún estudiante ha entregado aún.</p>
            ) : (
              (entregas as any[]).map((e) => {
                const cal = calificando[e.id] ?? { nota: e.nota?.toString() ?? "", comentario: e.comentario_docente ?? "" };
                const setCal = (patch: Partial<{ nota: string; comentario: string }>) =>
                  setCalificando(prev => ({ ...prev, [e.id]: { ...cal, ...patch } }));
                return (
                  <div key={e.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{e.estudiante?.name}</p>
                        <p className="text-xs text-muted-foreground">{e.estudiante?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.nota != null && <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10"><CheckCircle2 className="h-3 w-3 mr-1" />{e.nota}/{tareaEntregas?.puntaje_maximo}</Badge>}
                        {e.nota == null && <Badge variant="outline" className="text-muted-foreground">Sin calificar</Badge>}
                      </div>
                    </div>
                    {e.comentario_alumno && (
                      <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2 italic">"{e.comentario_alumno}"</p>
                    )}
                    {e.file_path && (
                      <a href={e.file_url ?? e.file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">
                        Ver archivo adjunto
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-xs">Nota (máx. {tareaEntregas?.puntaje_maximo})</Label>
                        <Input
                          type="number"
                          min="0"
                          max={tareaEntregas?.puntaje_maximo}
                          step="0.1"
                          placeholder="0"
                          value={cal.nota}
                          onChange={ev => setCal({ nota: ev.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Comentario al alumno</Label>
                        <Input
                          placeholder="Observaciones..."
                          value={cal.comentario}
                          onChange={ev => setCal({ comentario: ev.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="hero"
                        disabled={cal.nota === "" || mutCalificar.isPending}
                        onClick={() => mutCalificar.mutate({ entregaId: e.id, nota: Number(cal.nota), comentario_docente: cal.comentario || undefined })}
                      >
                        {e.nota != null ? "Actualizar calificación" : "Calificar"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog entregar tarea */}
      <Dialog open={!!tareaEntregar} onOpenChange={v => { if (!v) { setTareaEntregar(null); setComentario(""); setFileEntrega(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Entregar: {tareaEntregar?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="ecomentario">Comentario (opcional)</Label>
              <Textarea id="ecomentario" value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Comentario para el docente..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="efile">Archivo (opcional)</Label>
              <Input id="efile" type="file" onChange={e => setFileEntrega(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTareaEntregar(null)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutEntregar.mutate()} disabled={mutEntregar.isPending || (!comentario && !fileEntrega)}>
                {mutEntregar.isPending ? "Enviando..." : "Enviar entrega"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
