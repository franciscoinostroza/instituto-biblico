import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Calendar, FileText, BookOpen, Plus, Pencil, Trash2,
  ExternalLink, ChevronDown, ChevronUp, Globe, Phone, Mail, MapPin,
  Newspaper, Clock,
} from "lucide-react";
import { institutoService } from "@/services/endpoints";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PERIODOS = [
  { value: "general", label: "General", color: "bg-secondary text-secondary-foreground" },
  { value: "semanal", label: "Esta semana", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "mensual", label: "Este mes", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "anual", label: "Este año", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const CATEGORIAS_DOC = [
  { value: "reglamento", label: "Reglamento" },
  { value: "protocolo", label: "Protocolo" },
  { value: "pago", label: "Forma de pago" },
  { value: "inscripcion", label: "Inscripción" },
  { value: "otro", label: "Otro" },
];

const EVENT_COLORS = [
  { value: "#1E3A5F", label: "Azul oscuro" },
  { value: "#2D7D4E", label: "Verde" },
  { value: "#C0622B", label: "Terracota" },
  { value: "#7B3FA8", label: "Violeta" },
  { value: "#B45309", label: "Ámbar" },
];

export default function InstitutoPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const puedeEditar = user?.role === "admin" || user?.role === "editor";

  const { data: instituto } = useQuery({ queryKey: ["instituto"], queryFn: institutoService.getInstituto });
  const { data: noticias = [] } = useQuery({ queryKey: ["noticias"], queryFn: () => institutoService.getNoticias() });
  const { data: calendario = [] } = useQuery({ queryKey: ["calendario"], queryFn: institutoService.getCalendario });
  const { data: documentos = [] } = useQuery({ queryKey: ["documentos"], queryFn: institutoService.getDocumentos });

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Comunidad</p>
          <h1 className="font-display text-3xl font-semibold">{instituto?.name ?? "Instituto"}</h1>
          {instituto?.description && <p className="text-muted-foreground mt-1 max-w-xl">{instituto.description}</p>}
        </div>
        {puedeEditar && <EditInstitutoBtn instituto={instituto} qc={qc} />}
      </div>

      <Tabs defaultValue="actividades">
        <TabsList className="mb-6">
          <TabsTrigger value="actividades"><Newspaper className="h-4 w-4 mr-1.5" />Actividades</TabsTrigger>
          <TabsTrigger value="calendario"><Calendar className="h-4 w-4 mr-1.5" />Fechas importantes</TabsTrigger>
          <TabsTrigger value="recursos"><FileText className="h-4 w-4 mr-1.5" />Recursos</TabsTrigger>
          <TabsTrigger value="info"><Building2 className="h-4 w-4 mr-1.5" />Institución</TabsTrigger>
        </TabsList>

        {/* ── Actividades ─────────────────────────────────────── */}
        <TabsContent value="actividades">
          <ActividadesSection noticias={noticias as any[]} puedeEditar={puedeEditar} qc={qc} />
        </TabsContent>

        {/* ── Calendario ──────────────────────────────────────── */}
        <TabsContent value="calendario">
          <CalendarioSection eventos={calendario as any[]} puedeEditar={puedeEditar} qc={qc} />
        </TabsContent>

        {/* ── Recursos ────────────────────────────────────────── */}
        <TabsContent value="recursos">
          <RecursosSection documentos={documentos as any[]} puedeEditar={puedeEditar} qc={qc} />
        </TabsContent>

        {/* ── Info institucional ───────────────────────────────── */}
        <TabsContent value="info">
          <InfoSection instituto={instituto} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Editar información institucional (header)                   */
/* ─────────────────────────────────────────────────────────── */
function EditInstitutoBtn({ instituto, qc }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", address: "", phone: "", email: "", website: "" });

  const openDialog = () => {
    setForm({
      name: instituto?.name ?? "",
      description: instituto?.description ?? "",
      address: instituto?.address ?? "",
      phone: instituto?.phone ?? "",
      email: instituto?.email ?? "",
      website: instituto?.website ?? "",
    });
    setOpen(true);
  };

  const mut = useMutation({
    mutationFn: () => institutoService.updateInstituto(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instituto"] }); toast.success("Información actualizada"); setOpen(false); },
    onError: () => toast.error("Error al guardar"),
  });

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog}><Pencil className="h-3.5 w-3.5 mr-1.5" />Editar institución</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Información institucional</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            {([["name","Nombre","text"],["description","Descripción","textarea"],["address","Dirección","text"],["phone","Teléfono","text"],["email","Email","email"],["website","Sitio web","url"]] as [string,string,string][]).map(([key, label, type]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                {type === "textarea"
                  ? <Textarea rows={2} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  : <Input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                }
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mut.mutate()} disabled={mut.isPending}>
                {mut.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Actividades / noticias                                      */
/* ─────────────────────────────────────────────────────────── */
function ActividadesSection({ noticias, puedeEditar, qc }: any) {
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { title: "", body: "", periodo: "general" };
  const [form, setForm] = useState(emptyForm);

  const filtradas = filtroPeriodo === "todos" ? noticias : noticias.filter((n: any) => n.periodo === filtroPeriodo);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (n: any) => { setEditItem(n); setForm({ title: n.title, body: n.body, periodo: n.periodo ?? "general" }); setOpen(true); };

  const mut = useMutation({
    mutationFn: () => editItem
      ? institutoService.updateNoticia(editItem.id, form)
      : institutoService.crearNoticia(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["noticias"] }); toast.success(editItem ? "Actualizado" : "Publicado"); setOpen(false); },
    onError: () => toast.error("Error al guardar"),
  });

  const mutDel = useMutation({
    mutationFn: (id: number) => institutoService.deleteNoticia(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["noticias"] }); toast.success("Eliminado"); setDeleteId(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-secondary p-1 rounded-lg flex-wrap">
          {[{ value: "todos", label: "Todos" }, ...PERIODOS].map(p => (
            <button key={p.value} onClick={() => setFiltroPeriodo(p.value)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-smooth",
                filtroPeriodo === p.value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}>
              {p.label}
            </button>
          ))}
        </div>
        {puedeEditar && <Button variant="hero" size="sm" onClick={openCreate}><Plus className="h-4 w-4" />Nueva actividad</Button>}
      </div>

      {filtradas.length === 0 ? (
        <EmptyState icon={Newspaper} text="No hay actividades publicadas aún." />
      ) : (
        <div className="space-y-4">
          {filtradas.map((n: any) => {
            const periodo = PERIODOS.find(p => p.value === n.periodo);
            return (
              <article key={n.id} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {periodo && <Badge variant="outline" className={cn("text-xs", periodo.color)}>{periodo.label}</Badge>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(n.published_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  {puedeEditar && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(n)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(n.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{n.body}</p>
                {n.author && <p className="text-xs text-muted-foreground mt-3">— {n.author.name}</p>}
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Editar actividad" : "Nueva actividad"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la actividad" />
            </div>
            <div className="space-y-1.5"><Label>Período</Label>
              <Select value={form.periodo} onValueChange={v => setForm(f => ({ ...f, periodo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIODOS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Contenido</Label>
              <Textarea rows={5} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Descripción o detalle de la actividad..." className="resize-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mut.mutate()} disabled={!form.title || !form.body || mut.isPending}>
                {mut.isPending ? "Guardando..." : editItem ? "Guardar cambios" : "Publicar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId !== null && mutDel.mutate(deleteId)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Calendario                                                  */
/* ─────────────────────────────────────────────────────────── */
function CalendarioSection({ eventos, puedeEditar, qc }: any) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { title: "", description: "", date_start: "", date_end: "", color: "#1E3A5F" };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (e: any) => {
    setEditItem(e);
    setForm({ title: e.title, description: e.description ?? "", date_start: e.date_start?.slice(0, 10) ?? "", date_end: e.date_end?.slice(0, 10) ?? "", color: e.color ?? "#1E3A5F" });
    setOpen(true);
  };

  const mut = useMutation({
    mutationFn: () => editItem ? institutoService.updateEvento(editItem.id, form) : institutoService.crearEvento(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["calendario"] }); toast.success(editItem ? "Actualizado" : "Evento creado"); setOpen(false); },
    onError: () => toast.error("Error al guardar"),
  });

  const mutDel = useMutation({
    mutationFn: (id: number) => institutoService.deleteEvento(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["calendario"] }); toast.success("Eliminado"); setDeleteId(null); },
  });

  const upcoming = [...(eventos as any[])].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-lg font-semibold">Fechas importantes</h2>
        {puedeEditar && <Button variant="hero" size="sm" onClick={openCreate}><Plus className="h-4 w-4" />Agregar fecha</Button>}
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={Calendar} text="No hay fechas registradas aún." />
      ) : (
        <div className="space-y-3">
          {upcoming.map((ev: any) => (
            <div key={ev.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: ev.color ?? "#1E3A5F" }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{ev.title}</h3>
                {ev.description && <p className="text-sm text-muted-foreground mt-0.5">{ev.description}</p>}
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {ev.date_start === ev.date_end
                    ? new Date(ev.date_start + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
                    : `${new Date(ev.date_start + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })} — ${new Date(ev.date_end + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`
                  }
                </p>
              </div>
              {puedeEditar && (
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ev)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Editar fecha" : "Nueva fecha importante"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5"><Label>Descripción (opcional)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Fecha inicio</Label>
                <Input type="date" value={form.date_start} onChange={e => setForm(f => ({ ...f, date_start: e.target.value }))} />
              </div>
              <div className="space-y-1.5"><Label>Fecha fin</Label>
                <Input type="date" value={form.date_end} onChange={e => setForm(f => ({ ...f, date_end: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5"><Label>Color</Label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(c => (
                  <button key={c.value} title={c.label} onClick={() => setForm(f => ({ ...f, color: c.value }))}
                    className={cn("h-7 w-7 rounded-full border-2 transition-smooth", form.color === c.value ? "border-foreground scale-110" : "border-transparent")}
                    style={{ backgroundColor: c.value }} />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mut.mutate()} disabled={!form.title || !form.date_start || !form.date_end || mut.isPending}>
                {mut.isPending ? "Guardando..." : editItem ? "Guardar cambios" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId !== null && mutDel.mutate(deleteId)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Recursos clave (documentos)                                 */
/* ─────────────────────────────────────────────────────────── */
function RecursosSection({ documentos, puedeEditar, qc }: any) {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { title: "", description: "", url: "", category: "otro" };
  const [form, setForm] = useState(emptyForm);

  const mut = useMutation({
    mutationFn: () => institutoService.crearDocumento(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documentos"] }); toast.success("Recurso agregado"); setOpen(false); setForm(emptyForm); },
    onError: () => toast.error("Error al guardar"),
  });

  const mutDel = useMutation({
    mutationFn: (id: number) => institutoService.deleteDocumento(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documentos"] }); toast.success("Eliminado"); setDeleteId(null); },
  });

  const grouped = CATEGORIAS_DOC.map(cat => ({
    ...cat,
    items: (documentos as any[]).filter((d: any) => d.category === cat.value),
  })).filter(g => g.items.length > 0 || puedeEditar);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-lg font-semibold">Recursos clave</h2>
        {puedeEditar && <Button variant="hero" size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Agregar recurso</Button>}
      </div>

      {documentos.length === 0 && !puedeEditar ? (
        <EmptyState icon={FileText} text="No hay recursos publicados aún." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {grouped.map(cat => (
            <div key={cat.value} className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />{cat.label}
              </h3>
              {cat.items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sin recursos aún.</p>
              ) : (
                <ul className="space-y-2">
                  {cat.items.map((doc: any) => (
                    <li key={doc.id} className="flex items-start gap-2 group">
                      <a href={doc.url ?? `/api/documentos/${doc.id}/descargar`}
                        target="_blank" rel="noreferrer"
                        className="flex-1 min-w-0 hover:text-primary transition-smooth">
                        <p className="text-sm font-medium flex items-center gap-1.5 truncate">
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {doc.title}
                        </p>
                        {doc.description && <p className="text-xs text-muted-foreground truncate pl-5">{doc.description}</p>}
                      </a>
                      {puedeEditar && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(doc.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Agregar recurso</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label>Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Reglamento Académico 2024" />
            </div>
            <div className="space-y-1.5"><Label>Categoría</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DOC.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>URL del documento</Label>
              <Input type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-1.5"><Label>Descripción (opcional)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descripción del documento" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mut.mutate()} disabled={!form.title || !form.url || mut.isPending}>
                {mut.isPending ? "Guardando..." : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId !== null && mutDel.mutate(deleteId)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Info institucional (solo lectura aquí)                      */
/* ─────────────────────────────────────────────────────────── */
function InfoSection({ instituto }: any) {
  const campos = [
    { icon: MapPin, label: "Dirección", value: instituto?.address },
    { icon: Phone, label: "Teléfono", value: instituto?.phone },
    { icon: Mail, label: "Email", value: instituto?.email },
    { icon: Globe, label: "Sitio web", value: instituto?.website },
  ].filter(c => c.value);

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-lg font-semibold mb-4">Información institucional</h2>
      {campos.length === 0 ? (
        <EmptyState icon={Building2} text="Aún no se cargó información de contacto." />
      ) : (
        <div className="space-y-3">
          {campos.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Helpers                                                     */
/* ─────────────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
      <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ConfirmDelete({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
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
