import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Link2, PlayCircle, Download, Plus } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const iconMap = { archivo: FileText, link: Link2, video: PlayCircle };
const colorMap = {
  archivo: "bg-role-estudiante/10 text-role-estudiante",
  link: "bg-accent/10 text-accent",
  video: "bg-role-docente/10 text-role-docente",
};

export default function RecursosTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: recursos = [], isLoading } = useQuery({
    queryKey: ["recursos", id],
    queryFn: () => aulaService.recursos(Number(id)),
  });

  const puedeCrear = user?.role === "docente" || user?.role === "admin";
  const grouped = recursos.reduce<Record<string, typeof recursos>>((acc, r) => {
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
        {puedeCrear && <Button variant="hero"><Plus className="h-4 w-4" /> Subir recurso</Button>}
      </div>

      {isLoading ? (
        <div className="h-48 bg-secondary rounded-2xl animate-pulse" />
      ) : (
        <div className="space-y-8 max-w-4xl">
          {Object.entries(grouped).map(([unidad, items]) => (
            <section key={unidad}>
              <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3">{unidad}</h3>
              <div className="space-y-2">
                {items.map((r) => {
                  const Icon = iconMap[r.type];
                  return (
                    <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-smooth group">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", colorMap[r.type])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{r.title}</p>
                        {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
