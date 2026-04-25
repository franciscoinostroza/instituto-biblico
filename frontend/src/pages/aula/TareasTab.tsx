import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, Plus, Upload } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

export default function TareasTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: tareas = [], isLoading } = useQuery({
    queryKey: ["tareas", id],
    queryFn: () => aulaService.tareas(Number(id)),
  });

  const esDocente = user?.role === "docente" || user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Tareas</h2>
          <p className="text-sm text-muted-foreground">{tareas.length} actividades del curso</p>
        </div>
        {esDocente && <Button variant="hero"><Plus className="h-4 w-4" /> Nueva tarea</Button>}
      </div>

      {isLoading ? (
        <div className="h-32 bg-secondary rounded-2xl animate-pulse" />
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {tareas.map((t) => {
            const ms = new Date(t.fecha_limite).getTime() - Date.now();
            const dias = Math.ceil(ms / (1000 * 60 * 60 * 24));
            const vencida = ms < 0;
            const entregada = !!t.miEntrega;
            const calificada = !!t.miEntrega?.nota;

            return (
              <article key={t.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {/* Date pill */}
                  <div className="flex sm:flex-col items-center gap-2 sm:w-20 shrink-0">
                    <div className="text-center px-3 py-2 rounded-xl bg-secondary">
                      <p className="font-display text-2xl font-semibold leading-none text-foreground">
                        {new Date(t.fecha_limite).getDate()}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        {new Date(t.fecha_limite).toLocaleDateString("es-AR", { month: "short" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold leading-snug">{t.title}</h3>
                      <div className="flex items-center gap-2">
                        {!esDocente && calificada && (
                          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> {t.miEntrega?.nota}/{t.puntaje_maximo}
                          </Badge>
                        )}
                        {!esDocente && entregada && !calificada && (
                          <Badge className="bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20 hover:bg-role-estudiante/10">Entregada</Badge>
                        )}
                        {!esDocente && !entregada && !vencida && (
                          <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/10">
                            <Clock className="h-3 w-3 mr-1" /> {dias} días
                          </Badge>
                        )}
                        {!esDocente && !entregada && vencida && (
                          <Badge variant="destructive">Vencida</Badge>
                        )}
                        {esDocente && (
                          <Badge variant="outline">{t.totalEntregas}/{t.totalEsperadas} entregadas</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Vence {new Date(t.fecha_limite).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}</span>
                      <span>Puntaje máximo: {t.puntaje_maximo}</span>
                      {t.permite_entrega_tardia && <span className="text-accent">Acepta tardías</span>}
                    </div>
                    <div className="mt-5 flex gap-2">
                      {esDocente ? (
                        <Button variant="outline" size="sm">Ver entregas</Button>
                      ) : entregada ? (
                        <Button variant="outline" size="sm">Ver mi entrega</Button>
                      ) : (
                        <Button variant="hero" size="sm" disabled={vencida && !t.permite_entrega_tardia}>
                          <Upload className="h-3.5 w-3.5" /> Entregar tarea
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
