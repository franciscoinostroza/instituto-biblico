import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const estadoBadge = (estado: string) => {
  if (estado === "calificado") return <Badge className="bg-green-100 text-green-700 border-green-300">Calificado</Badge>;
  if (estado === "finalizado") return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pendiente revisión</Badge>;
  return <Badge variant="secondary">En progreso</Badge>;
};

const tipoLabel: Record<string, string> = {
  opcion_multiple: "Opción múltiple", multiple_choice: "Opción múltiple",
  multiple_correctas: "Múltiples respuestas", verdadero_falso: "V/F",
  respuesta_corta: "Respuesta corta", desarrollo: "Desarrollo",
  completar_espacios: "Completar espacios", emparejar: "Emparejar", ordenar: "Ordenar",
};

export default function ExamenResultados() {
  const { id: materiaId, examenId } = useParams<{ id: string; examenId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [expanded, setExpanded] = useState<number | null>(null);
  const [notasMap, setNotasMap] = useState<Record<number, string>>({});

  const { data: examen } = useQuery({
    queryKey: ["examen", materiaId, examenId],
    queryFn: () => aulaService.getExamen(Number(materiaId), Number(examenId)),
  });

  const { data: intentos = [], isLoading } = useQuery({
    queryKey: ["intentos", materiaId, examenId],
    queryFn: () => aulaService.listarIntentos(Number(materiaId), Number(examenId)),
  });

  const mutCalificar = useMutation({
    mutationFn: ({ intentoId, nota }: { intentoId: number; nota: number }) =>
      aulaService.calificarDesarrollo(Number(materiaId), Number(examenId), intentoId, nota),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intentos", materiaId, examenId] });
      toast.success("Nota guardada");
    },
    onError: () => toast.error("Error al guardar la nota"),
  });

  const { data: detalleIntento } = useQuery({
    queryKey: ["intento-detalle", materiaId, examenId, expanded],
    queryFn: () => aulaService.getIntento(Number(materiaId), Number(examenId), expanded!),
    enabled: expanded !== null,
  });

  const calificados   = (intentos as any[]).filter(i => i.estado === "calificado").length;
  const pendientes    = (intentos as any[]).filter(i => i.estado === "finalizado").length;
  const promedio      = calificados > 0
    ? ((intentos as any[]).filter(i => i.estado === "calificado").reduce((s, i) => s + (i.nota_final ?? 0), 0) / calificados).toFixed(1)
    : "--";

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/materias/${materiaId}/examenes`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Resultados</p>
            <h1 className="font-display font-semibold truncate">{examen?.title ?? "..."}</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total entregas",        value: (intentos as any[]).length, icon: Award },
            { label: "Pendientes revisión",   value: pendientes, icon: Clock },
            { label: "Promedio",              value: promedio, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
        ) : (intentos as any[]).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Aún no hay entregas.</div>
        ) : (
          <div className="space-y-3">
            {(intentos as any[]).map((intento: any) => {
              const isOpen = expanded === intento.id;
              const detalle = isOpen ? detalleIntento : null;
              const respuestas: any[] = detalle?.respuestas ?? [];

              return (
                <div key={intento.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/30 transition-smooth"
                    onClick={() => setExpanded(isOpen ? null : intento.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{intento.estudiante?.name}</p>
                      <p className="text-xs text-muted-foreground">{intento.estudiante?.email}</p>
                    </div>
                    {estadoBadge(intento.estado)}
                    {intento.nota_final !== null && (
                      <span className="font-mono text-sm font-semibold">{intento.nota_final} pts</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(intento.iniciado_at).toLocaleDateString("es-AR")}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      {!detalle && <div className="h-8 bg-secondary rounded animate-pulse" />}

                      {respuestas.map((r: any) => {
                        const tipo = r.pregunta?.tipo;
                        const necesitaManual = tipo === "desarrollo" || (tipo === "respuesta_corta" && !r.pregunta?.datos_extra?.respuesta_esperada);

                        return (
                          <div key={r.id} className="bg-secondary/50 rounded-xl p-3 text-sm">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-medium text-foreground leading-snug">{r.pregunta?.enunciado}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground">{tipoLabel[tipo] ?? tipo}</span>
                                {r.es_correcta !== null && !necesitaManual && (
                                  r.es_correcta
                                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    : <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                {r.puntaje_obtenido !== null && (
                                  <Badge variant="outline" className="text-xs">{r.puntaje_obtenido} pts</Badge>
                                )}
                              </div>
                            </div>

                            {/* Answer display */}
                            {r.texto_respuesta && (
                              <div className="bg-background rounded-lg p-2 border border-border text-muted-foreground">{r.texto_respuesta}</div>
                            )}
                            {r.respuesta_extra && (
                              <div className="bg-background rounded-lg p-2 border border-border text-muted-foreground text-xs">
                                {JSON.stringify(r.respuesta_extra)}
                              </div>
                            )}
                            {r.opcion && (
                              <div className={cn("inline-block px-2 py-1 rounded-lg text-xs", r.es_correcta ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                {r.opcion.texto}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Manual grading */}
                      {intento.estado === "finalizado" && (
                        <div className="border-t border-border pt-3 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Nota de preguntas de desarrollo</p>
                            <p className="text-xs text-muted-foreground">Nota automática: {intento.nota_automatica ?? 0} pts</p>
                          </div>
                          <Input
                            type="number" min={0} step={0.5}
                            value={notasMap[intento.id] ?? ""}
                            onChange={e => setNotasMap(m => ({ ...m, [intento.id]: e.target.value }))}
                            placeholder="Pts desarrollo"
                            className="w-32"
                          />
                          <Button variant="hero" size="sm"
                            onClick={() => mutCalificar.mutate({ intentoId: intento.id, nota: parseFloat(notasMap[intento.id] ?? "0") })}
                            disabled={mutCalificar.isPending}>
                            Guardar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
