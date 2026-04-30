import { useState } from "react";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { Rol } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const filtros: { label: string; value: Rol | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Administradores", value: "admin" },
  { label: "Editores", value: "editor" },
  { label: "Docentes", value: "docente" },
  { label: "Estudiantes", value: "estudiante" },
];

const rolChip: Record<string, string> = {
  admin:      "bg-role-admin/10 text-role-admin border-role-admin/20",
  editor:     "bg-role-editor/10 text-role-editor border-role-editor/20",
  docente:    "bg-role-docente/10 text-role-docente border-role-docente/20",
  estudiante: "bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20",
};

type UsuarioRow = { id: number; name: string; email: string; role: string; active: boolean };

const EMPTY_FORM = { name: "", email: "", password: "", role: "estudiante" as Rol };

export default function AdminUsuarios() {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<Rol | "todos">("todos");
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UsuarioRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: usuarios = [] } = useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: adminService.usuarios,
  });

  const lista = (usuarios as UsuarioRow[])
    .filter((u) => filtro === "todos" || u.role === filtro)
    .filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  const crearMut = useMutation({
    mutationFn: () => adminService.crearUsuario(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });
      setDialogOpen(false);
      toast.success("Usuario creado");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Error al crear usuario"),
  });

  const editarMut = useMutation({
    mutationFn: () => adminService.actualizarUsuario(editing!.id, { name: form.name, email: form.email, role: form.role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });
      setDialogOpen(false);
      toast.success("Usuario actualizado");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Error al actualizar usuario"),
  });

  const eliminarMut = useMutation({
    mutationFn: () => adminService.eliminarUsuario(deleteTarget!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });
      setDeleteTarget(null);
      toast.success("Usuario eliminado");
    },
    onError: () => toast.error("Error al eliminar usuario"),
  });

  const toggleMut = useMutation({
    mutationFn: (u: UsuarioRow) => adminService.toggleActiveUsuario(u.id),
    onSuccess: (_d, u) => {
      qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });
      toast.success(u.active ? "Usuario desactivado" : "Usuario activado");
    },
    onError: () => toast.error("Error al cambiar estado"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (u: UsuarioRow) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role as Rol });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) editarMut.mutate();
    else crearMut.mutate();
  };

  const isPending = crearMut.isPending || editarMut.isPending;
  const isValid = form.name.trim() && form.email.trim() && (editing || form.password.trim());

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Gestión"
        title="Usuarios"
        description={`${usuarios.length} usuarios registrados en la plataforma`}
        actions={<Button variant="hero" onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo usuario</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o email…" className="pl-10 bg-card" />
        </div>
        <div className="flex gap-1 bg-secondary p-1 rounded-lg">
          {filtros.map((f) => (
            <button
              key={f.value} onClick={() => setFiltro(f.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-smooth",
                filtro === f.value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Usuario</th>
              <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left px-5 py-3 font-medium">Rol</th>
              <th className="text-left px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/30 transition-smooth">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">
                        {u.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={cn("capitalize", rolChip[u.role])}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs", u.active ? "text-success" : "text-muted-foreground")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", u.active ? "bg-success" : "bg-muted-foreground")} />
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(u)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleMut.mutate(u)}>
                        {u.active
                          ? <><ToggleLeft className="h-4 w-4 mr-2" /> Desactivar</>
                          : <><ToggleRight className="h-4 w-4 mr-2" /> Activar</>
                        }
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(u)}
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
          <div className="py-12 text-center text-sm text-muted-foreground">No se encontraron usuarios</div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Juan Pérez" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="juan@ejemplo.com" />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Contraseña</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Mínimo 8 caracteres" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Rol }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="docente">Docente</SelectItem>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={!isValid || isPending}>
              {isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar eliminación */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
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
