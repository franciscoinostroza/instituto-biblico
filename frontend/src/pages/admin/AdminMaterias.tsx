import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, MoreHorizontal, Users } from "lucide-react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminService } from "@/services/endpoints";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type MateriaRow = {
  id: number; name: string; code: string; description?: string;
  carrera_id: number; carrera?: { id: number; name: string } | string;
  periodo_id: number; periodo?: { id: number; name: string };
  docente_id?: number; docente?: { id: number; name: string };
  active: boolean; totalEstudiantes?: number;
};

const EMPTY_FORM = {
  name: "", code: "", description: "",
  carrera_id: "", periodo_id: "", docente_id: "",
};

export default function AdminMaterias() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MateriaRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MateriaRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [q, setQ] = useState("");

  const { data: materias = [] } = useQuery({
    queryKey: ["admin", "materias"],
    queryFn: adminService.materiasAdmin,
  });
  const { data: carreras = [] } = useQuery({
    queryKey: ["admin", "carreras"],
    queryFn: adminService.carreras,
  });
  const { data: periodos = [] } = useQuery({
    queryKey: ["admin", "periodos"],
    queryFn: adminService.periodos,
  });
  const { data: docentes = [] } = useQuery({
    queryKey: ["admin", "usuarios", "docente"],
    queryFn: () => adminService.usuariosPorRol("docente"),
  });

  const lista = (materias as MateriaRow[]).filter((m) =>
    m.name.toLowerCase().includes(q.toLowerCase()) || m.code.toLowerCase().includes(q.toLowerCase())
  );

  const crearMut = useMutation({
    mutationFn: () => adminService.crearMateria({
      name: form.name, code: form.code, description: form.description,
      carrera_id: Number(form.carrera_id), periodo_id: Number(form.periodo_id),
      ...(form.docente_id ? { docente_id: Number(form.docente_id) } : {}),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materias"] });
      setDialogOpen(false);
      toast.success("Materia creada");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Error al crear materia"),
  });

  const editarMut = useMutation({
    mutationFn: () => adminService.actualizarMateria(editing!.id, {
      name: form.name, code: form.code, description: form.description,
      carrera_id: Number(form.carrera_id), periodo_id: Number(form.periodo_id),
      ...(form.docente_id ? { docente_id: Number(form.docente_id) } : {}),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materias"] });
      setDialogOpen(false);
      toast.success("Materia actualizada");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Error al actualizar materia"),
  });

  const eliminarMut = useMutation({
    mutationFn: () => adminService.eliminarMateria(deleteTarget!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materias"] });
      setDeleteTarget(null);
      toast.success("Materia eliminada");
    },
    onError: () => toast.error("Error al eliminar materia"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (m: MateriaRow) => {
    setEditing(m);
    setForm({
      name: m.name, code: m.code, description: m.description ?? "",
      carrera_id: String(m.carrera_id), periodo_id: String(m.periodo_id),
      docente_id: m.docente_id ? String(m.docente_id) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) editarMut.mutate();
    else crearMut.mutate();
  };

  const isPending = crearMut.isPending || editarMut.isPending;
  const isValid = form.name.trim() && form.code.trim() && form.carrera_id && form.periodo_id;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Académico"
        title="Materias"
        description="Asignaturas de todos los programas"
        actions={<Button variant="hero" onClick={openCreate}><Plus className="h-4 w-4" /> Nueva materia</Button>}
      />

      <div className="mb-6">
        <Input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o código…"
          className="max-w-md bg-card"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Materia</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Carrera</th>
              <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Docente</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/30 transition-smooth">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">
                  {typeof m.carrera === "object" ? m.carrera?.name : m.carrera ?? "—"}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {m.docente?.name ?? "Sin asignar"}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={cn(
                    m.active ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"
                  )}>
                    {m.active ? "Activa" : "Inactiva"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(m)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No se encontraron materias
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar materia" : "Nueva materia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Hermenéutica Bíblica" />
              </div>
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="Ej: HB-101" />
              </div>
              <div className="space-y-1.5">
                <Label>Carrera</Label>
                <Select value={form.carrera_id} onValueChange={(v) => setForm((f) => ({ ...f, carrera_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    {(carreras as any[]).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Período lectivo</Label>
                <Select value={form.periodo_id} onValueChange={(v) => setForm((f) => ({ ...f, periodo_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                  <SelectContent>
                    {(periodos as any[]).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Docente asignado</Label>
                <Select value={form.docente_id} onValueChange={(v) => setForm((f) => ({ ...f, docente_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    {(docentes as any[]).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción breve de la materia…"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={!isValid || isPending}>
              {isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear materia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar eliminación */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar materia</DialogTitle>
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
