import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { aulaService } from "@/services/endpoints";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function NotasTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: notas = [], isLoading } = useQuery({
    queryKey: ["notas", id],
    queryFn: () => aulaService.notas(Number(id)),
  });

  // Estudiante ve solo sus notas
  const visibles = user?.role === "estudiante" ? notas.filter(n => n.estudiante_id === user.id) : notas;

  // Agrupar por estudiante para vista docente
  const porEstudiante = visibles.reduce<Record<number, typeof visibles>>((acc, n) => {
    (acc[n.estudiante_id] = acc[n.estudiante_id] ?? []).push(n);
    return acc;
  }, {});

  const esEstudiante = user?.role === "estudiante";

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold">{esEstudiante ? "Mis notas" : "Libro de calificaciones"}</h2>
        <p className="text-sm text-muted-foreground">
          {esEstudiante ? "Tus calificaciones en esta materia" : "Calificaciones de todos los estudiantes inscriptos"}
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-secondary rounded-2xl animate-pulse" />
      ) : esEstudiante ? (
        <div className="max-w-2xl space-y-3">
          {visibles.map((n) => (
            <div key={n.id} className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
              <div>
                <Badge variant="outline" className="mb-2 capitalize">{n.tipo.replace("_", " ")}</Badge>
                <p className="font-medium text-foreground">{n.descripcion}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-semibold text-foreground">{n.nota}<span className="text-base text-muted-foreground">/{n.puntaje_maximo}</span></p>
              </div>
            </div>
          ))}
          {visibles.length > 0 && (
            <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-hero text-primary-foreground mt-6">
              <p className="font-display text-lg">Promedio actual</p>
              <p className="font-display text-3xl font-semibold">
                {(visibles.reduce((a, n) => a + n.nota, 0) / visibles.length).toFixed(1)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Estudiante</th>
                {Array.from(new Set(visibles.map(n => n.descripcion))).map(d => (
                  <th key={d} className="text-center px-3 py-3 font-medium">{d}</th>
                ))}
                <th className="text-center px-5 py-3 font-medium">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Object.entries(porEstudiante).map(([estId, ns]) => {
                const est = ns[0].estudiante;
                const prom = ns.reduce((a, n) => a + n.nota, 0) / ns.length;
                return (
                  <tr key={estId} className="hover:bg-secondary/30 transition-smooth">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-xs">{est?.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{est?.name}</span>
                      </div>
                    </td>
                    {Array.from(new Set(visibles.map(n => n.descripcion))).map(d => {
                      const n = ns.find(x => x.descripcion === d);
                      return (
                        <td key={d} className="text-center px-3 py-3">
                          {n ? <span className="font-medium">{n.nota}</span> : <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                    <td className="text-center px-5 py-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">{prom.toFixed(1)}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
