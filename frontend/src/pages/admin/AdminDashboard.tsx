import { Users, GraduationCap, BookOpen, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { adminService } from "@/services/endpoints";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data: usuarios = [] } = useQuery({ queryKey: ["admin", "usuarios"], queryFn: adminService.usuarios });
  const { data: carreras = [] } = useQuery({ queryKey: ["admin", "carreras"], queryFn: adminService.carreras });

  const estudiantes = usuarios.filter((u: { role: string }) => u.role === "estudiante").length;
  const docentes = usuarios.filter((u: { role: string }) => u.role === "docente").length;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Panel administrativo"
        title={`Buen día, ${user?.name.split(" ")[0]}`}
        description="Resumen general del instituto y accesos rápidos a la gestión académica."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/admin/reportes">Ver reportes</Link></Button>
            <Button variant="hero" asChild><Link to="/admin/usuarios"><Plus className="h-4 w-4" /> Nuevo usuario</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Estudiantes activos" value={estudiantes} icon={<Users className="h-5 w-5" />} accent="primary" />
        <StatCard label="Docentes" value={docentes} icon={<GraduationCap className="h-5 w-5" />} accent="accent" />
        <StatCard label="Carreras activas" value={carreras.length} icon={<BookOpen className="h-5 w-5" />} accent="estudiante" />
        <StatCard label="Tasa de aprobación" value="—" icon={<TrendingUp className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Carreras */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-semibold">Carreras</h2>
              <p className="text-xs text-muted-foreground">{carreras.length} programas activos</p>
            </div>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/carreras">Ver todas <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          <div className="space-y-3">
            {carreras.map((c: { id: number; name: string; totalMaterias?: number; totalEstudiantes?: number }) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary transition-smooth">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.totalMaterias != null ? `${c.totalMaterias} materias` : ""}
                      {c.totalEstudiantes != null ? ` · ${c.totalEstudiantes} estudiantes` : ""}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">Activa</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Últimos usuarios */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold">Últimos ingresos</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/usuarios"><ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          <div className="space-y-3">
            {usuarios.slice(0, 5).map((u: { id: number; name: string; role: string }) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                    {u.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
