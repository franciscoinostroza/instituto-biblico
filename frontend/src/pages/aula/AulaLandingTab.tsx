import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone, Folder, ScrollText, Calendar, CheckCircle2,
  Plus, ExternalLink, Download, Edit3, Target, BookOpen, FileText,
  FileQuestion, ArrowRight, Upload, Link2, PlayCircle,
} from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<string, any> = { archivo: FileText, link: Link2, video: PlayCircle };
const colorMap: Record<string, string> = {
  archivo: "bg-role-estudiante/10 text-role-estudiante",
  link:    "bg-accent/10 text-accent",
  video:   "bg-role-docente/10 text-role-docente",
};

function SectionTitle({
  icon: Icon, title, action,
}: { icon: React.ElementType; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function AulaLandingTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const puedeEditar = user?.role === "docente" || user?.role === "admin";
  const esDocente   = puedeEditar;

  // ── Anuncios ──────────────────────────────────────────────────────────────
  const { data: anuncios = [], isLoading: loadingAnuncios } = useQuery({
    queryKey: ["anuncios", materiaId],
    queryFn: () => aulaService.anuncios(materiaId),
  });

  const [anuncioOpen, setAnuncioOpen] = useState(false);
  const [anuncioTitle, setAnuncioTitle] = useState("");
  const [anuncioBody, setAnuncioBody] = useState("");

  const mutAnuncio = useMutation({
    mutationFn: () => aulaService.crearAnuncio(materiaId, { title: anuncioTitle, body: anuncioBody }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anuncios", materiaId] });
      toast.success("Anuncio publicado");
      setAnuncioOpen(false);
      setAnuncioTitle("");
      setAnuncioBody("");
    },
    onError: () => toast.error("Error al publicar el anuncio"),
  });

  // ── Recursos ──────────────────────────────────────────────────────────────
  const { data: recursos = [], isLoading: loadingRecursos } = useQuery({
    queryKey: ["recursos", materiaId],
    queryFn: () => aulaService.recursos(materiaId),
  });

  const [recursoOpen, setRecursoOpen] = useState(false);
  const [rTipo, setRTipo] = useState<"link" | "video" | "archivo">("link");
  const [rTitle, setRTitle] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [rUrl, setRUrl] = useState("");
  const [rUnidad, setRUnidad] = useState("");
  const [rFile, setRFile] = useState<File | null>(null);

  const resetRecurso = () => { setRTitle(""); setRDesc(""); setRUrl(""); setRUnidad(""); setRFile(null); setRTipo("link"); };

  const mutRecurso = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("title", rTitle);
      fd.append("type", rTipo);
      if (rDesc) fd.append("description", rDesc);
      if (rUnidad) fd.append("unidad", rUnidad);
      if (rTipo !== "archivo" && rUrl) fd.append("url", rUrl);
      if (rTipo === "archivo" && rFile) fd.append("file", rFile);
      return aulaService.crearRecurso(materiaId, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recursos", materiaId] });
      toast.success("Recurso agregado");
      setRecursoOpen(false);
      resetRecurso();
    },
    onError: () => toast.error("Error al agregar el recurso"),
  });

  const grouped = (recursos as any[]).reduce<Record<string, any[]>>((acc, r) => {
    const key = r.unidad ?? "General";
    (acc[key] = acc[key] ?? []).push(r);
    return acc;
  }, {});

  // ── Tareas y exámenes ────────────────────────────────────────────────────
  const { data: tareas = [] } = useQuery({
    queryKey: ["tareas", materiaId],
    queryFn: () => aulaService.tareas(materiaId),
  });

  const { data: examenes = [] } = useQuery({
    queryKey: ["examenes", materiaId],
    queryFn: () => aulaService.examenes(materiaId),
  });

  const now = Date.now();
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "short" });

  const proximasTareas = (tareas as any[])
    .filter((t) => t.fecha_limite && new Date(t.fecha_limite).getTime() > now)
    .sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())
    .slice(0, 4);

  const proximosExamenes = (examenes as any[])
    .filter((e) => new Date(e.fecha_cierre).getTime() > now)
    .sort((a, b) => new Date(a.fecha_apertura).getTime() - new Date(b.fecha_apertura).getTime())
    .slice(0, 3);

  // ── Plan de curso ─────────────────────────────────────────────────────────
  const { data: plan, isLoading: loadingPlan } = useQuery({
    queryKey: ["plan", materiaId],
    queryFn: () => aulaService.planCurso(materiaId),
  });

  const [planOpen, setPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ content: "", objetivos: "", bibliografia: "" });

  useEffect(() => {
    if (plan && planOpen) {
      setPlanForm({ content: plan.content ?? "", objetivos: plan.objetivos ?? "", bibliografia: plan.bibliografia ?? "" });
    }
  }, [plan, planOpen]);

  const mutPlan = useMutation({
    mutationFn: () => aulaService.actualizarPlanCurso(materiaId, planForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan", materiaId] });
      toast.success("Plan de curso actualizado");
      setPlanOpen(false);
    },
    onError: () => toast.error("Error al actualizar el plan"),
  });

  return (
    <div className="space-y-8">

      {/* ── Fila superior: Anuncios | Recursos ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Anuncios */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle
            icon={Megaphone}
            title="Anuncios"
            action={puedeEditar && (
              <Button variant="hero" size="sm" onClick={() => setAnuncioOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Nuevo
              </Button>
            )}
          />
          {loadingAnuncios ? (
            <div className="space-y-3">{[0, 1].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
          ) : (anuncios as any[]).length === 0 ? (
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-border">
              <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aún no hay anuncios.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(anuncios as any[]).map((a) => (
                <article key={a.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-medium">
                        {a.autor?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                        <h3 className="font-display text-sm font-semibold leading-tight">{a.title}</h3>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(a.published_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-1">{a.autor?.name}</p>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line line-clamp-3">{a.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Recursos */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle
            icon={Folder}
            title="Recursos del curso"
            action={puedeEditar && (
              <Button variant="hero" size="sm" onClick={() => setRecursoOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Subir
              </Button>
            )}
          />
          {loadingRecursos ? (
            <div className="h-32 bg-secondary rounded-xl animate-pulse" />
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-border">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aún no hay recursos cargados.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([unidadKey, items]) => (
                <section key={unidadKey}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{unidadKey}</p>
                  <div className="space-y-1.5">
                    {(items as any[]).map((r) => {
                      const Icon = iconMap[r.type] ?? FileText;
                      return (
                        <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-background hover:border-primary/30 transition-smooth group">
                          <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", colorMap[r.type] ?? colorMap.archivo)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-foreground truncate">{r.title}</p>
                            {r.description && <p className="text-[10px] text-muted-foreground truncate">{r.description}</p>}
                          </div>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          {r.file_url && (
                            <a href={r.file_url} target="_blank" rel="noopener noreferrer" download>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Fila inferior: Actividades próximas | Plan de curso ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Próximas actividades */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle icon={Calendar} title="Próximas actividades" />

          {/* Tareas */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tareas</p>
              <Link to="../tareas" className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                Ver todas <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            {proximasTareas.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Sin tareas próximas</p>
            ) : (
              <ul className="space-y-2">
                {proximasTareas.map((t) => {
                  const dias = Math.ceil((new Date(t.fecha_limite).getTime() - now) / (1000 * 60 * 60 * 24));
                  const entrega = t.mi_entrega ?? t.miEntrega;
                  return (
                    <li key={t.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border">
                      <div className={cn(
                        "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                        entrega ? "bg-success/15 text-success" : "bg-accent/15 text-accent",
                      )}>
                        {entrega ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Upload className="h-2.5 w-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-tight truncate">{t.title}</p>
                        <p className={cn("text-[11px]", dias <= 3 ? "text-destructive" : "text-muted-foreground")}>
                          {entrega ? "Entregada" : `Vence en ${dias}d · ${fmtDate(t.fecha_limite)}`}
                        </p>
                      </div>
                      {!esDocente && !entrega && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{t.puntaje_maximo} pts</Badge>
                      )}
                      {esDocente && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{t.entregas_count ?? 0} entregas</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Exámenes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Exámenes</p>
              <Link to="../examenes" className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                Ver todos <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            {proximosExamenes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Sin exámenes próximos</p>
            ) : (
              <ul className="space-y-2">
                {proximosExamenes.map((e) => {
                  const abierto = now >= new Date(e.fecha_apertura).getTime() && now <= new Date(e.fecha_cierre).getTime();
                  return (
                    <li key={e.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/40 border border-border">
                      <div className={cn(
                        "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                        abierto ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
                      )}>
                        <FileQuestion className="h-2.5 w-2.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-tight truncate">{e.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {abierto ? "Disponible ahora" : `Abre ${fmtDate(e.fecha_apertura)}`}
                          {" · "}Cierra {fmtDate(e.fecha_cierre)}
                        </p>
                      </div>
                      {abierto && <Badge className="text-[10px] bg-success/10 text-success border-success/20 shrink-0">Abierto</Badge>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Plan de curso */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle
            icon={ScrollText}
            title="Plan de curso"
            action={puedeEditar && (
              <Button variant="outline" size="sm" onClick={() => setPlanOpen(true)}>
                <Edit3 className="h-3.5 w-3.5" /> {plan ? "Editar" : "Crear"}
              </Button>
            )}
          />
          {loadingPlan ? (
            <div className="h-32 bg-secondary rounded-xl animate-pulse" />
          ) : !plan?.content && !plan?.objetivos ? (
            <div className="text-center py-10 rounded-xl border-2 border-dashed border-border">
              <ScrollText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">El plan de curso aún no está definido.</p>
              {puedeEditar && (
                <Button variant="hero" size="sm" className="mt-3" onClick={() => setPlanOpen(true)}>Crear plan</Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {plan?.content && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-3.5 w-3.5" /></div>
                    <h3 className="font-display text-sm font-semibold">Descripción</h3>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{plan.content}</p>
                </div>
              )}
              {plan?.objetivos && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-md bg-accent/10 text-accent flex items-center justify-center"><Target className="h-3.5 w-3.5" /></div>
                    <h3 className="font-display text-sm font-semibold">Objetivos</h3>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{plan.objetivos}</p>
                </div>
              )}
              {plan?.bibliografia && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-md bg-role-estudiante/10 text-role-estudiante flex items-center justify-center"><BookOpen className="h-3.5 w-3.5" /></div>
                    <h3 className="font-display text-sm font-semibold">Bibliografía</h3>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{plan.bibliografia}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}

      <Dialog open={anuncioOpen} onOpenChange={setAnuncioOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nuevo anuncio</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="an-title">Título</Label>
              <Input id="an-title" value={anuncioTitle} onChange={e => setAnuncioTitle(e.target.value)} placeholder="Ej: Recordatorio de parcial" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="an-body">Contenido</Label>
              <Textarea id="an-body" value={anuncioBody} onChange={e => setAnuncioBody(e.target.value)} placeholder="Escribí el contenido del anuncio..." rows={5} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAnuncioOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutAnuncio.mutate()} disabled={!anuncioTitle.trim() || !anuncioBody.trim() || mutAnuncio.isPending}>
                {mutAnuncio.isPending ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={recursoOpen} onOpenChange={(v) => { setRecursoOpen(v); if (!v) resetRecurso(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Agregar recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Tipo de recurso</Label>
              <Select value={rTipo} onValueChange={(v: any) => setRTipo(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Enlace web</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="archivo">Archivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-title">Título</Label>
              <Input id="r-title" value={rTitle} onChange={e => setRTitle(e.target.value)} placeholder="Nombre del recurso" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-desc">Descripción (opcional)</Label>
              <Input id="r-desc" value={rDesc} onChange={e => setRDesc(e.target.value)} placeholder="Breve descripción" />
            </div>
            {rTipo !== "archivo" ? (
              <div className="space-y-2">
                <Label htmlFor="r-url">URL</Label>
                <Input id="r-url" type="url" value={rUrl} onChange={e => setRUrl(e.target.value)} placeholder="https://..." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="r-file">Archivo</Label>
                <Input id="r-file" type="file" onChange={e => setRFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="r-unidad">Unidad (opcional)</Label>
              <Input id="r-unidad" value={rUnidad} onChange={e => setRUnidad(e.target.value)} placeholder="Ej: Unidad 1 — Introducción" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setRecursoOpen(false); resetRecurso(); }}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutRecurso.mutate()} disabled={!rTitle.trim() || mutRecurso.isPending}>
                {mutRecurso.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{plan ? "Editar plan de curso" : "Crear plan de curso"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Descripción del curso</Label>
              <Textarea value={planForm.content} onChange={e => setPlanForm(f => ({ ...f, content: e.target.value }))} placeholder="Descripción general del curso..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Objetivos</Label>
              <Textarea value={planForm.objetivos} onChange={e => setPlanForm(f => ({ ...f, objetivos: e.target.value }))} placeholder="Objetivos de aprendizaje..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Bibliografía</Label>
              <Textarea value={planForm.bibliografia} onChange={e => setPlanForm(f => ({ ...f, bibliografia: e.target.value }))} placeholder="Bibliografía recomendada..." rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPlanOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutPlan.mutate()} disabled={mutPlan.isPending}>
                {mutPlan.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
