import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/endpoints";
import type { Rol } from "@/types";
import { cn } from "@/lib/utils";

const filtros: { label: string; value: Rol | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Administradores", value: "admin" },
  { label: "Docentes", value: "docente" },
  { label: "Estudiantes", value: "estudiante" },
];

export default function AdminUsuarios() {
  const [filtro, setFiltro] = useState<Rol | "todos">("todos");
  const [q, setQ] = useState("");
  const { data: usuarios = [] } = useQuery({ queryKey: ["admin", "usuarios"], queryFn: adminService.usuarios });

  const lista = usuarios
    .filter((u: { role: string }) => filtro === "todos" || u.role === filtro)
    .filter((u: { name: string; email: string }) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Gestión"
        title="Usuarios"
        description={`${usuarios.length} usuarios registrados en la plataforma`}
        actions={<Button variant="hero"><Plus className="h-4 w-4" /> Nuevo usuario</Button>}
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
                      <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs">{u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className={cn(
                    "capitalize",
                    u.role === "admin" && "bg-role-admin/10 text-role-admin border-role-admin/20",
                    u.role === "docente" && "bg-role-docente/10 text-role-docente border-role-docente/20",
                    u.role === "estudiante" && "bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20",
                  )}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Activo
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
