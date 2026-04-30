import { useState } from "react";
import { GraduationCap, Plus, Users, BookOpen, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminService } from "@/services/endpoints";
import { toast } from "sonner";

type CarreraRow = { id: number; name: string; description?: string; totalMaterias?: number; totalEstudiantes?: number };

const EMPTY_FORM = { name: "", description: "" };

export default function AdminCarreras() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CarreraRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarreraRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: carreras = [] } = useQuery({
    queryKey: ["admin", "carreras"],
    queryFn: adminService.carreras,
  });

  const crearMut = useMutation({
    mutationFn: () => adminService.crearCarrera(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "carreras"] });
      setDialogOpen(false);
      toast.success("Carrera creada");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Error al crear carrera"),
  });

  const editarMut = useMutation({
    mutationFn: () => adminService.actualizarCarrera(editing!.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "carreras"] });
      setDialogOpen(false);
      toast.success("Carrera actualizada");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Error al actualizar carrera"),
  });

  const eliminarMut = useMutation({
    mutationFn: () => adminService.eliminarCarrera(deleteTarget!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "carreras"] });
      setDeleteTarget(null);
      toast.success("Carrera eliminada");
    },
    onError: () => toast.error("Error al eliminar carrera"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (c: CarreraRow) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "" });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) editarMut.mutate();
    else crearMut.mutate();
  };

  const isPending = crearMut.isPending || editarMut.isPending;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Académico"
        title="Carreras"
        description="Programas educativos del instituto"
        actions={<Button variant="hero" onClick={openCreate}><Plus className="h-4 w-4" /> Nueva carrera</Button>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(carreras as CarreraRow[]).map((c) => (
          <article key={c.id} className="relative rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth">
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteTarget(c)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-11 w-11 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center mb-4">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug mb-2 pr-8">{c.name}</h3>
            <p className="text-sm text-muted-foreground mb-5">{c.description}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {c.totalMaterias ?? 0} materias</span>
                <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {c.totalEstudiantes ?? 0}</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Activa</Badge>
            </div>
          </article>
        ))}

        {carreras.length === 0 && (
          <div className="col-span-3 py-16 text-center text-sm text-muted-foreground">
            No hay carreras registradas. Creá la primera.
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar carrera" : "Nueva carrera"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Teología Bíblica" />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del programa…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={!form.name.trim() || isPending}>
              {isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear carrera"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar eliminación */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar carrera</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => eliminarMut.mutate()} disabled={eliminarMut.isPending}>
              {eliminarMut.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
