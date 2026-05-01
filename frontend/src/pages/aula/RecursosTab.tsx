import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Link2, PlayCircle, Download, Plus, ExternalLink } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<string, any> = { archivo: FileText, link: Link2, video: PlayCircle };
const colorMap: Record<string, string> = {
  archivo: "bg-role-estudiante/10 text-role-estudiante",
  link: "bg-accent/10 text-accent",
  video: "bg-role-docente/10 text-role-docente",
};

export default function RecursosTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const { data: recursos = [], isLoading } = useQuery({
    queryKey: ["recursos", materiaId],
    queryFn: () => aulaService.recursos(materiaId),
  });

  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"link" | "video" | "archivo">("link");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [unidad, setUnidad] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => { setTitle(""); setDescription(""); setUrl(""); setUnidad(""); setFile(null); setTipo("link"); };

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("type", tipo);
      if (description) fd.append("description", description);
      if (unidad) fd.append("unidad", unidad);
      if (tipo !== "archivo" && url) fd.append("url", url);
      if (tipo === "archivo" && file) fd.append("file", file);
      return aulaService.crearRecurso(materiaId, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recursos", materiaId] });
      toast.success("Recurso agregado");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Error al agregar el recurso"),
  });

  const puedeCrear = user?.role === "docente" || user?.role === "admin";

  const grouped = (recursos as any[]).reduce<Record<string, any[]>>((acc, r) => {
    const key = r.unidad ?? "General";
    (acc[key] = acc[key] ?? []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Recursos del curso</h2>
          <p className="text-sm text-muted-foreground">Material de estudio organizado por unidad</p>
        </div>
        {puedeCrear && (
          <Button variant="hero" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Subir recurso
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="h-48 bg-secondary rounded-2xl animate-pulse" />
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aún no hay recursos cargados.</p>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl">
          {Object.entries(grouped).map(([unidadKey, items]) => (
            <section key={unidadKey}>
              <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">{unidadKey}</h3>
              <div className="space-y-2">
                {items.map((r: any) => {
                  const Icon = iconMap[r.type] ?? FileText;
                  return (
                    <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-smooth group">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", colorMap[r.type] ?? colorMap.archivo)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{r.title}</p>
                        {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                      </div>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {r.file_url && (
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer" download>
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

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Agregar recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Tipo de recurso</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Enlace web</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="archivo">Archivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rtitle">Título</Label>
              <Input id="rtitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del recurso" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rdesc">Descripción (opcional)</Label>
              <Input id="rdesc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descripción" />
            </div>
            {tipo !== "archivo" ? (
              <div className="space-y-2">
                <Label htmlFor="rurl">URL</Label>
                <Input id="rurl" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="rfile">Archivo</Label>
                <Input id="rfile" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="runidad">Unidad (opcional)</Label>
              <Input id="runidad" value={unidad} onChange={e => setUnidad(e.target.value)} placeholder="Ej: Unidad 1 — Introducción" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutation.mutate()} disabled={!title.trim() || mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
