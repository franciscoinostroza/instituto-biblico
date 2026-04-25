import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Calendar, X } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function AnunciosTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const { data: anuncios = [], isLoading } = useQuery({
    queryKey: ["anuncios", materiaId],
    queryFn: () => aulaService.anuncios(materiaId),
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: () => aulaService.crearAnuncio(materiaId, { title, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anuncios", materiaId] });
      toast.success("Anuncio publicado");
      setOpen(false);
      setTitle("");
      setBody("");
    },
    onError: () => toast.error("Error al publicar el anuncio"),
  });

  const puedeCrear = user?.role === "docente" || user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Anuncios</h2>
          <p className="text-sm text-muted-foreground">Comunicaciones del docente al curso</p>
        </div>
        {puedeCrear && (
          <Button variant="hero" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo anuncio
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[0, 1].map(i => <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />)}</div>
      ) : anuncios.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aún no hay anuncios.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {anuncios.map((a: any) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-medium">
                    {a.autor?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">{a.title}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(a.published_at).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{a.autor?.name}</p>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{a.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo anuncio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Recordatorio de parcial" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Contenido</Label>
              <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} placeholder="Escribí el contenido del anuncio..." rows={5} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutation.mutate()} disabled={!title.trim() || !body.trim() || mutation.isPending}>
                {mutation.isPending ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
