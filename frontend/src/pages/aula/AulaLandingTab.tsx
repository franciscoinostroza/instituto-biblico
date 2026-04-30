import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone, Folder, ScrollText, Calendar, Clock, CheckCircle2,
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

// ─── helpers ────────────────────────────────────────────────────────────────

const iconMap: Record<string, any> = { archivo: FileText, link: Link2, video: PlayCircle };
const colorMap: Record<string, string> = {
  archivo: "bg-role-estudiante/10 text-role-estudiante",
  link:    "bg-accent/10 text-accent",
  video:   "bg-role-docente/10 text-role-docente",
};

function Divider() {
  return <div className="border-t border-border my-10" />;
}

function SectionHeader({
  icon: Icon, title, subtitle, action,
}: { icon: React.ElementType; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Próximas actividades widget ─────────────────────────────────────────────

function ProximasActividades({ materiaId }: { materiaId: number }) {
  const { user } = useAuthStore();
  const esDocente = user?.role === "docente" || user?.role === "admin";

  const { data: tareas = [] } = useQuery({
    queryKey: ["tareas", materiaId],
    queryFn: () => aulaService.tareas(materiaId),
  });

  const { data: examenes = [] } = useQuery({
    queryKey: ["examenes", materiaId],
    queryFn: () => aulaService.examenes(materiaId),
  });

  const now = Date.now();

  const proximasTareas = (tareas as any[])
    .filter((t) => new Date(t.fecha_limite).getTime() > now)
    .sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())
    .slice(0, 3);

  const proximosExamenes = (examenes as any[])
    .filter((e) => new Date(e.fecha_cierre).getTime() > now)
    .sort((a, b) => new Date(a.fecha_apertura).getTime() - new Date(b.fecha_apertura).getTime())
    .slice(0, 3);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "short" });

  const diasRestantes = (d: string) => {
    const ms = new Date(d).getTime() - now;
    const dias = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return dias;
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5 lg:sticky lg:top-28">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Calendar className="h-4 w-4" />
        </div>
        <h3 className="font-display font-semibold text-sm">Próximas actividades</h3>
      </div>

      {/* Tareas */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tareas</p>
        {proximasTareas.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Sin tareas próximas</p>
        ) : (
          <ul className="space-y-2">
            {proximasTareas.map((t) => {
              const dias = diasRestantes(t.fecha_limite);
              const entrega = t.mi_entrega ?? t.miEntrega;
              const entregada = !!entrega;
              return (
                <li key={t.id} className="flex items-start gap-2.5">
                  <div className={cn(
                    "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                    entregada ? "bg-success/15 text-success" : "bg-accent/15 text-accent",
                  )}>
                    {entregada ? <CheckCircle2 className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight truncate">{t.title}</p>
                    <p className={cn("text-[11px]", dias <= 3 ? "text-destructive" : "text-muted-foreground")}>
                      {entregada ? "Entregada" : `Vence en ${dias}d · ${fmtDate(t.fecha_limite)}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link to={`tareas`} className="mt-2.5 flex items-center gap-1 text-xs text-accent hover:underline w-fit">
          Ver todas las tareas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="border-t border-border" />

      {/* Exámenes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Exámenes</p>
        {proximosExamenes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Sin exámenes próximos</p>
        ) : (
          <ul className="space-y-2">
            {proximosExamenes.map((e) => {
              const abierto = now >= new Date(e.fecha_apertura).getTime() && now <= new Date(e.fecha_cierre).getTime();
              return (
                <li key={e.id} className="flex items-start gap-2.5">
                  <div className={cn(
                    "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                    abierto ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
                  )}>
                    <FileQuestion className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight truncate">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {abierto ? "Disponible ahora" : `Abre ${fmtDate(e.fecha_apertura)}`}
                      {" · "}Cierra {fmtDate(e.fecha_cierre)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link to={`examenes`} className="mt-2.5 flex items-center gap-1 text-xs text-accent hover:underline w-fit">
          Ver todos los exámenes <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {esDocente && (
        <>
          <div className="border-t border-border" />
          <p className="text-xs text-muted-foreground">
            Gestioná tareas y exámenes desde sus pestañas respectivas.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AulaLandingTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const puedeEditar = user?.role === "docente" || user?.role === "admin";

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Anuncios ── */}
      <SectionHeader
        icon={Megaphone}
        title="Anuncios"
        subtitle="Comunicaciones del docente al curso"
        action={puedeEditar && (
          <Button variant="hero" onClick={() => setAnuncioOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo anuncio
          </Button>
        )}
      />

      {loadingAnuncios ? (
        <div className="space-y-4">{[0, 1].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary animate-pulse" />)}</div>
      ) : (anuncios as any[]).length === 0 ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
          <Megaphone className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aún no hay anuncios.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {(anuncios as any[]).map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition-smooth">
              <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-medium">
                    {a.autor?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-display text-base font-semibold leading-tight">{a.title}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(a.published_at).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{a.autor?.name}</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{a.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Divider />

      {/* ── Recursos + Próximas actividades ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recursos (2/3) */}
        <div className="lg:col-span-2">
          <SectionHeader
            icon={Folder}
            title="Recursos del curso"
            subtitle="Material de estudio organizado por unidad"
            action={puedeEditar && (
              <Button variant="hero" onClick={() => setRecursoOpen(true)}>
                <Plus className="h-4 w-4" /> Subir recurso
              </Button>
            )}
          />

          {loadingRecursos ? (
            <div className="h-40 bg-secondary rounded-2xl animate-pulse" />
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
              <FileText className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aún no hay recursos cargados.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([unidadKey, items]) => (
                <section key={unidadKey}>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{unidadKey}</h3>
                  <div className="space-y-2">
                    {(items as any[]).map((r) => {
                      const Icon = iconMap[r.type] ?? FileText;
                      return (
                        <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-smooth group">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", colorMap[r.type] ?? colorMap.archivo)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{r.title}</p>
                            {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                          </div>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {r.file_path && (
                            <a href={aulaService.descargarRecurso(materiaId, r.id)} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                                <Download className="h-4 w-4" />
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

        {/* Próximas actividades widget (1/3) */}
        <div className="lg:col-span-1">
          <ProximasActividades materiaId={materiaId} />
        </div>
      </div>

      <Divider />

      {/* ── Plan de curso ── */}
      <SectionHeader
        icon={ScrollText}
        title="Plan de curso"
        subtitle={plan?.updated_at
          ? `Actualizado: ${new Date(plan.updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}`
          : "Programa y objetivos del curso"}
        action={puedeEditar && (
          <Button variant="outline" onClick={() => setPlanOpen(true)}>
            <Edit3 className="h-4 w-4" /> {plan ? "Editar plan" : "Crear plan"}
          </Button>
        )}
      />

      {loadingPlan ? (
        <div className="h-40 bg-secondary rounded-2xl animate-pulse" />
      ) : !plan?.content && !plan?.objetivos ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
          <ScrollText className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">El plan de curso aún no está definido.</p>
          {puedeEditar && (
            <Button variant="hero" className="mt-4" onClick={() => setPlanOpen(true)}>Crear plan de curso</Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {plan?.content && (
            <section className="rounded-2xl border border-border bg-card p-5 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                <h3 className="font-display text-base font-semibold">Descripción</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{plan.content}</p>
            </section>
          )}
          {plan?.objetivos && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><Target className="h-4 w-4" /></div>
                <h3 className="font-display text-base font-semibold">Objetivos</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{plan.objetivos}</p>
            </section>
          )}
          {plan?.bibliografia && (
            <section className="rounded-2xl border border-border bg-card p-5 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-lg bg-role-estudiante/10 text-role-estudiante flex items-center justify-center"><BookOpen className="h-4 w-4" /></div>
                <h3 className="font-display text-base font-semibold">Bibliografía</h3>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{plan.bibliografia}</p>
            </section>
          )}
        </div>
      )}

      {/* ── Dialogs ── */}

      {/* Nuevo anuncio */}
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

      {/* Subir recurso */}
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

      {/* Editar plan de curso */}
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
