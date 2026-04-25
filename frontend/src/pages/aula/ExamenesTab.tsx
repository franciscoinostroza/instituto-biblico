import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, FileQuestion, Plus, Play, CheckCircle2 } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

export default function ExamenesTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: examenes = [], isLoading } = useQuery({
    queryKey: ["examenes", id],
    queryFn: () => aulaService.examenes(Number(id)),
  });
  const esDocente = user?.role === "docente" || user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Exámenes y controles</h2>
          <p className="text-sm text-muted-foreground">Evaluaciones del curso</p>
        </div>
        {esDocente && <Button variant="hero"><Plus className="h-4 w-4" /> Nuevo examen</Button>}
      </div>

      {isLoading ? (
        <div className="h-32 bg-secondary rounded-2xl animate-pulse" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
          {examenes.map((e) => {
            const abierto = new Date() >= new Date(e.fecha_apertura) && new Date() <= new Date(e.fecha_cierre);
            const finalizado = !!e.miIntento && e.miIntento.estado !== "en_progreso";

            return (
              <article key={e.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileQuestion className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={e.tipo === "examen" ? "bg-accent/10 text-accent border-accent/20" : "bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20"}>
                    {e.tipo === "examen" ? "Examen" : "Control"}
                  </Badge>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug mb-2">{e.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{e.descripcion}</p>

                <div className="grid grid-cols-2 gap-3 text-xs mb-5 pb-5 border-b border-border">
                  <div>
                    <p className="text-muted-foreground">Duración</p>
                    <p className="font-medium flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {e.tiempo_limite_minutos} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Preguntas</p>
                    <p className="font-medium mt-0.5">{e.totalPreguntas}</p>
                  </div>
                </div>

                {!esDocente && finalizado && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" /> Calificado
                    </span>
                    <span className="font-display text-2xl font-semibold text-foreground">{e.miIntento?.nota}/10</span>
                  </div>
                )}
                {!esDocente && !finalizado && (
                  <Button variant={abierto ? "hero" : "outline"} disabled={!abierto} className="w-full">
                    <Play className="h-4 w-4" />
                    {abierto ? "Iniciar examen" : `Abre ${new Date(e.fecha_apertura).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`}
                  </Button>
                )}
                {esDocente && (
                  <Button variant="outline" className="w-full">Ver intentos</Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
