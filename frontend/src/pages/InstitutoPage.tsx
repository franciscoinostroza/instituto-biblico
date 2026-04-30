import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Calendar, FileText, BookOpen, Plus, Pencil, Trash2,
  ExternalLink, Globe, Phone, Mail, MapPin, Newspaper, Clock, Download,
} from "lucide-react";
import { institutoService } from "@/services/endpoints";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Constantes ───────────────────────────────────────────── */
const PERIODOS = [
  { value: "general",  label: "General",     color: "bg-secondary text-secondary-foreground" },
  { value: "semanal",  label: "Esta semana",  color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400" },
  { value: "mensual",  label: "Este mes",     color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400" },
  { value: "anual",    label: "Este año",     color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400" },
];

const CATEGORIAS_DOC = [
  { value: "reglamento",  label: "Reglamento",     icon: "📋" },
  { value: "protocolo",   label: "Protocolo",       icon: "📌" },
  { value: "pago",        label: "Forma de pago",   icon: "💳" },
  { value: "inscripcion", label: "Inscripción",     icon: "✏️" },
  { value: "otro",        label: "Otro",            icon: "📄" },
];

const EVENT_COLORS = [
  { value: "#1E3A5F", label: "Azul" },
  { value: "#2D7D4E", label: "Verde" },
  { value: "#C0622B", label: "Terracota" },
  { value: "#7B3FA8", label: "Violeta" },
  { value: "#B45309", label: "Ámbar" },
];

/* ── Page ─────────────────────────────────────────────────── */
export default function InstitutoPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const puedeEditar = user?.role === "admin" || user?.role === "editor";

  const { data: instituto } = useQuery({ queryKey: ["instituto"],   queryFn: institutoService.getInstituto });
  const { data: noticias   = [] } = useQuery({ queryKey: ["noticias"],    queryFn: () => institutoService.getNoticias() });
  const { data: calendario = [] } = useQuery({ queryKey: ["calendario"],  queryFn: institutoService.getCalendario });
  const { data: documentos = [] } = useQuery({ queryKey: ["documentos"],  queryFn: institutoService.getDocumentos });

  const contactos = [
    { icon: MapPin,  label: "Dirección", value: instituto?.address },
    { icon: Phone,   label: "Teléfono",  value: instituto?.phone   },
    { icon: Mail,    label: "Email",     value: instituto?.email    },
    { icon: Globe,   label: "Web",       value: instituto?.website  },
  ].filter(c => c.value);

  return (
    <div className="min-h-screen">

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative container max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Logo o icono del instituto */}
              {instituto?.logo ? (
                <img src={instituto.logo} alt="Logo" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20 shrink-0" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 ring-4 ring-white/20">
                  <Building2 className="h-9 w-9 text-white/80" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-semibold mb-1">Comunidad</p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                  {instituto?.name ?? "Instituto"}
                </h1>
                {instituto?.description && (
                  <p className="text-white/70 mt-2 max-w-xl text-sm leading-relaxed">
                    {instituto.description}
                  </p>
                )}
              </div>
            </div>

            {puedeEditar && <EditInstitutoBtn instituto={instituto} qc={qc} />}
          </div>

          {/* Contactos */}
          {contactos.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {contactos.map(({ icon: Icon, label, value }) => (
                <a
                  key={label}
                  href={label === "Web" ? value : label === "Email" ? `mailto:${value}` : label === "Teléfono" ? `tel:${value}` : undefined}
                  target={label === "Web" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-smooth text-sm text-white/90"
                >
                  <Icon className="h-3.5 w-3.5 text-white/60 shrink-0" />
                  <span className="truncate max-w-[200px]">{value}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ CONTENIDO ══════════════════════════════════════════ */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── Noticias / Actividades ─────────────────────────── */}
        <section>
          <SectionHeader
            icon={Newspaper}
            title="Actividades y noticias"
            subtitle="Novedades de la comunidad del instituto"
            action={puedeEditar
              ? <NuevoNoticiaBtn qc={qc} />
              : null
            }
          />
          <NoticiasContent noticias={noticias as any[]} puedeEditar={puedeEditar} qc={qc} />
        </section>

        <Divider />

        {/* ── Calendario académico ───────────────────────────── */}
        <section>
          <SectionHeader
            icon={Calendar}
            title="Fechas importantes"
            subtitle="Calendario académico y eventos del año"
            action={puedeEditar
              ? <NuevoEventoBtn qc={qc} />
              : null
            }
          />
          <CalendarioContent eventos={calendario as any[]} puedeEditar={puedeEditar} qc={qc} />
        </section>

        <Divider />

        {/* ── Recursos / Documentos ─────────────────────────── */}
        <section>
          <SectionHeader
            icon={FileText}
            title="Recursos y documentos"
            subtitle="Material institucional para estudiantes y docentes"
            action={puedeEditar
              ? <NuevoDocumentoBtn qc={qc} />
              : null
            }
          />
          <DocumentosContent documentos={documentos as any[]} puedeEditar={puedeEditar} qc={qc} />
        </section>

      </div>
    </div>
  );
}

/* ── Section header ───────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: any; title: string; subtitle: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border" />;
}

/* ══════════════════════════════════════════════════════════ */
/* NOTICIAS                                                    */
/* ══════════════════════════════════════════════════════════ */
function NoticiasContent({ noticias, puedeEditar, qc }: any) {
  const [filtro, setFiltro] = useState("todos");
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtradas = filtro === "todos" ? noticias : noticias.filter((n: any) => n.periodo === filtro);

  const mutDel = useMutation({
    mutationFn: (id: number) => institutoService.deleteNoticia(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["noticias"] }); toast.success("Eliminado"); setDeleteId(null); },
  });

  return (
    <div>
      {/* Filtros por período */}
      <div className="flex gap-1.5 bg-secondary/50 p-1 rounded-xl mb-6 w-fit flex-wrap">
        {[{ value: "todos", label: "Todos" }, ...PERIODOS].map((p) => (
          <button
            key={p.value} onClick={() => setFiltro(p.value)}
            className={cn(
              "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-smooth",
              filtro === p.value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState icon={Newspaper} text="No hay actividades publicadas aún." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtradas.map((n: any) => {
            const periodo = PERIODOS.find((p) => p.value === n.periodo);
            return (
              <article key={n.id} className="group bg-card border border-border rounded-2xl p-6 hover:shadow-elegant transition-smooth flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {periodo && (
                      <Badge variant="outline" className={cn("text-[10px]", periodo.color)}>
                        {periodo.label}
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(n.published_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  {puedeEditar && (
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-smooth">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditItem(n)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(n.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 leading-snug">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line flex-1">{n.body}</p>
                {n.author && (
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    Publicado por <span className="font-medium">{n.author.name}</span>
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Modal editar */}
      {editItem && (
        <NoticiaDialog
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["noticias"] }); setEditItem(null); }}
        />
      )}

      <ConfirmDelete
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && mutDel.mutate(deleteId)}
      />
    </div>
  );
}

function NuevoNoticiaBtn({ qc }: { qc: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nueva actividad
      </Button>
      {open && (
        <NoticiaDialog
          item={null}
          onClose={() => setOpen(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["noticias"] }); setOpen(false); }}
        />
      )}
    </>
  );
}

function NoticiaDialog({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: item?.title ?? "",
    body: item?.body ?? "",
    periodo: item?.periodo ?? "general",
  });

  const mut = useMutation({
    mutationFn: () => item
      ? institutoService.updateNoticia(item.id, form)
      : institutoService.crearNoticia(form),
    onSuccess: () => { toast.success(item ? "Actualizado" : "Publicado"); onSaved(); },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título de la actividad" />
          </div>
          <div className="space-y-1.5">
            <Label>Período</Label>
            <Select value={form.periodo} onValueChange={(v) => setForm((f) => ({ ...f, periodo: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODOS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Contenido</Label>
            <Textarea
              rows={5} value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Descripción o detalle de la actividad…"
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="hero" onClick={() => mut.mutate()} disabled={!form.title || !form.body || mut.isPending}>
            {mut.isPending ? "Guardando..." : item ? "Guardar cambios" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* CALENDARIO                                                  */
/* ══════════════════════════════════════════════════════════ */
function CalendarioContent({ eventos, puedeEditar, qc }: any) {
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const sorted = [...(eventos as any[])].sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );

  const mutDel = useMutation({
    mutationFn: (id: number) => institutoService.deleteEvento(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["calendario"] }); toast.success("Eliminado"); setDeleteId(null); },
  });

  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  const fmtFull = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  if (sorted.length === 0) return <EmptyState icon={Calendar} text="No hay fechas importantes registradas aún." />;

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((ev: any) => {
          const isSameDay = ev.date_start === ev.date_end;
          const day = new Date(ev.date_start + "T00:00:00").getDate();
          const month = new Date(ev.date_start + "T00:00:00").toLocaleDateString("es-AR", { month: "short" });
          return (
            <div
              key={ev.id}
              className="group relative bg-card border border-border rounded-2xl p-5 hover:shadow-elegant transition-smooth overflow-hidden"
            >
              {/* Barra de color lateral */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ backgroundColor: ev.color ?? "#1E3A5F" }}
              />

              <div className="pl-3 flex items-start gap-4">
                {/* Fecha en formato calendario */}
                <div
                  className="shrink-0 flex flex-col items-center justify-center rounded-xl h-14 w-12 text-white"
                  style={{ backgroundColor: ev.color ?? "#1E3A5F" }}
                >
                  <span className="text-xl font-bold leading-none">{day}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-80 mt-0.5">{month}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground leading-snug">{ev.title}</h3>
                  {ev.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>
                  )}
                  {!isSameDay && (
                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {fmt(ev.date_start)} — {fmtFull(ev.date_end)}
                    </p>
                  )}
                </div>
              </div>

              {puedeEditar && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditItem(ev)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteId(ev.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editItem && (
        <EventoDialog
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["calendario"] }); setEditItem(null); }}
        />
      )}
      <ConfirmDelete
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && mutDel.mutate(deleteId)}
      />
    </div>
  );
}

function NuevoEventoBtn({ qc }: { qc: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Agregar fecha
      </Button>
      {open && (
        <EventoDialog
          item={null}
          onClose={() => setOpen(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["calendario"] }); setOpen(false); }}
        />
      )}
    </>
  );
}

function EventoDialog({ item, onClose, onSaved }: { item: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: item?.title ?? "",
    description: item?.description ?? "",
    date_start: item?.date_start?.slice(0, 10) ?? "",
    date_end: item?.date_end?.slice(0, 10) ?? "",
    color: item?.color ?? "#1E3A5F",
  });

  const mut = useMutation({
    mutationFn: () => item
      ? institutoService.updateEvento(item.id, form)
      : institutoService.crearEvento(form),
    onSuccess: () => { toast.success(item ? "Actualizado" : "Evento creado"); onSaved(); },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar fecha" : "Nueva fecha importante"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción (opcional)</Label>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha inicio</Label>
              <Input type="date" value={form.date_start} onChange={(e) => setForm((f) => ({ ...f, date_start: e.target.value, date_end: f.date_end || e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha fin</Label>
              <Input type="date" value={form.date_end} min={form.date_start} onChange={(e) => setForm((f) => ({ ...f, date_end: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2.5">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value} title={c.label}
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={cn("h-7 w-7 rounded-full border-2 transition-smooth", form.color === c.value ? "border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/30" : "border-transparent")}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="hero" onClick={() => mut.mutate()} disabled={!form.title || !form.date_start || !form.date_end || mut.isPending}>
            {mut.isPending ? "Guardando..." : item ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* DOCUMENTOS                                                  */
/* ══════════════════════════════════════════════════════════ */
function DocumentosContent({ documentos, puedeEditar, qc }: any) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const mutDel = useMutation({
    mutationFn: (id: number) => institutoService.deleteDocumento(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documentos"] }); toast.success("Eliminado"); setDeleteId(null); },
  });

  const grouped = CATEGORIAS_DOC.map((cat) => ({
    ...cat,
    items: (documentos as any[]).filter((d: any) => d.category === cat.value),
  })).filter((g) => g.items.length > 0);

  if (grouped.length === 0) return <EmptyState icon={FileText} text="No hay recursos publicados aún." />;

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {grouped.map((cat) => (
          <div key={cat.value} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl">{cat.icon}</span>
              <h3 className="font-semibold text-sm">{cat.label}</h3>
              <span className="ml-auto text-xs text-muted-foreground">{cat.items.length}</span>
            </div>
            <ul className="space-y-2.5">
              {cat.items.map((doc: any) => (
                <li key={doc.id} className="group flex items-start gap-2">
                  <a
                    href={doc.url ?? `/api/documentos/${doc.id}/descargar`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 min-w-0 hover:text-primary transition-smooth"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                        {doc.url ? <ExternalLink className="h-3.5 w-3.5 text-primary" /> : <Download className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        {doc.description && (
                          <p className="text-[11px] text-muted-foreground truncate">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </a>
                  {puedeEditar && (
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-smooth"
                      onClick={() => setDeleteId(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ConfirmDelete
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId !== null && mutDel.mutate(deleteId)}
      />
    </div>
  );
}

function NuevoDocumentoBtn({ qc }: { qc: any }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "", category: "otro" });

  const mut = useMutation({
    mutationFn: () => institutoService.crearDocumento(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Recurso agregado");
      setOpen(false);
      setForm({ title: "", description: "", url: "", category: "otro" });
    },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <>
      <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Agregar recurso
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Agregar recurso</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: Reglamento Académico 2024" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DOC.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>URL del documento</Label>
              <Input type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/…" />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={() => mut.mutate()} disabled={!form.title || !form.url || mut.isPending}>
              {mut.isPending ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Editar info institucional ────────────────────────────── */
function EditInstitutoBtn({ instituto, qc }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", address: "", phone: "", email: "", website: "" });

  const openDialog = () => {
    setForm({
      name:        instituto?.name        ?? "",
      description: instituto?.description ?? "",
      address:     instituto?.address     ?? "",
      phone:       instituto?.phone       ?? "",
      email:       instituto?.email       ?? "",
      website:     instituto?.website     ?? "",
    });
    setOpen(true);
  };

  const mut = useMutation({
    mutationFn: () => institutoService.updateInstituto(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instituto"] }); toast.success("Información actualizada"); setOpen(false); },
    onError: () => toast.error("Error al guardar"),
  });

  const fields: [string, string, string][] = [
    ["name",        "Nombre",      "text"],
    ["description", "Descripción", "textarea"],
    ["address",     "Dirección",   "text"],
    ["phone",       "Teléfono",    "text"],
    ["email",       "Email",       "email"],
    ["website",     "Sitio web",   "url"],
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openDialog}
        className="border-white/30 text-white hover:bg-white/15 hover:text-white bg-white/10 backdrop-blur shrink-0"
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar institución
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Información institucional</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {fields.map(([key, label, type]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                {type === "textarea"
                  ? <Textarea rows={2} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  : <Input type={type} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                }
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={() => mut.mutate()} disabled={mut.isPending}>
              {mut.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
      <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ConfirmDelete({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este elemento?</AlertDialogTitle>
          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
