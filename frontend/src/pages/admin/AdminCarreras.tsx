import { GraduationCap, Plus, Users, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/endpoints";

export default function AdminCarreras() {
  const { data: carreras = [] } = useQuery({ queryKey: ["admin", "carreras"], queryFn: adminService.carreras });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Académico"
        title="Carreras"
        description="Programas educativos del instituto"
        actions={<Button variant="hero"><Plus className="h-4 w-4" /> Nueva carrera</Button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {carreras.map((c: { id: number; name: string; description?: string; totalMaterias?: number; totalEstudiantes?: number }) => (
          <article key={c.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth">
            <div className="h-11 w-11 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center mb-4">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug mb-2">{c.name}</h3>
            <p className="text-sm text-muted-foreground mb-5">{c.description}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {c.totalMaterias} materias</span>
                <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {c.totalEstudiantes}</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Activa</Badge>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
