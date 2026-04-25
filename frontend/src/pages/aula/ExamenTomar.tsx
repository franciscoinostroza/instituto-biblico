import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RespuestaLocal = {
  opcion_id?: number | null;
  texto_respuesta?: string;
  respuesta_extra?: Record<string, any>;
};

export default function ExamenTomar() {
  const { id: materiaId, examenId } = useParams<{ id: string; examenId: string }>();
  const navigate = useNavigate();

  const [intento, setIntento] = useState<any>(null);
  const [respuestas, setRespuestas] = useState<Record<number, RespuestaLocal>>({});
  const [submitDone, setSubmitDone] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const { data: examen, isLoading: loadingExamen } = useQuery({
    queryKey: ["examen-tomar", materiaId, examenId],
    queryFn: () => aulaService.getExamen(Number(materiaId), Number(examenId)),
  });

  // Iniciar intento al cargar
  const mutIniciar = useMutation({
    mutationFn: () => aulaService.iniciarExamen(Number(materiaId), Number(examenId)),
    onSuccess: (data) => {
      setIntento(data);
      // pre-cargar respuestas existentes
      const prevResps: Record<number, RespuestaLocal> = {};
      (data.respuestas ?? []).forEach((r: any) => {
        prevResps[r.pregunta_id] = {
          opcion_id: r.opcion_id,
          texto_respuesta: r.texto_respuesta,
          respuesta_extra: r.respuesta_extra,
        };
      });
      setRespuestas(prevResps);
    },
    onError: () => toast.error("Error al iniciar el examen"),
  });

  useEffect(() => {
    if (examen) mutIniciar.mutate();
  }, [examen]);

  // Timer
  useEffect(() => {
    if (!intento || !examen?.tiempo_limite_minutos) return;
    const limite = examen.tiempo_limite_minutos * 60;
    const inicio = new Date(intento.iniciado_at).getTime();
    const update = () => {
      const elapsed = Math.floor((Date.now() - inicio) / 1000);
      const remaining = limite - elapsed;
      setTiempoRestante(Math.max(0, remaining));
      if (remaining <= 0 && !submitDone) handleSubmit();
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [intento, examen, submitDone]);

  const mutResponder = useMutation({
    mutationFn: (data: any) => aulaService.responderPregunta(Number(materiaId), Number(examenId), intento.id, data),
  });

  const mutSubmit = useMutation({
    mutationFn: () => aulaService.submitExamen(Number(materiaId), Number(examenId), intento.id),
    onSuccess: (data) => { setSubmitDone(true); setResultado(data); toast.success("Examen entregado"); },
    onError: () => toast.error("Error al entregar el examen"),
  });

  const saveRespuesta = useCallback((preguntaId: number, data: RespuestaLocal) => {
    if (!intento) return;
    setSavingId(preguntaId);
    mutResponder.mutate({ pregunta_id: preguntaId, ...data }, {
      onSettled: () => setSavingId(null),
    });
  }, [intento, mutResponder]);

  const setResp = (preguntaId: number, data: Partial<RespuestaLocal>) => {
    setRespuestas(prev => {
      const updated = { ...prev, [preguntaId]: { ...prev[preguntaId], ...data } };
      saveRespuesta(preguntaId, updated[preguntaId]);
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!intento) return;
    mutSubmit.mutate();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loadingExamen || mutIniciar.isPending) {
    return <div className="container mx-auto p-8"><div className="h-32 bg-secondary rounded-2xl animate-pulse" /></div>;
  }

  if (submitDone && resultado) {
    const estado = resultado.estado;
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-semibold mb-2">Examen entregado</h1>
        {estado === "calificado" && resultado.nota_final !== null ? (
          <p className="text-muted-foreground mb-6">Obtuviste <span className="font-semibold text-foreground text-xl">{resultado.nota_final}</span> puntos.</p>
        ) : (
          <p className="text-muted-foreground mb-6">Tu examen fue recibido. El docente revisará las preguntas de desarrollo.</p>
        )}
        <Button variant="outline" onClick={() => navigate(`/materias/${materiaId}/examenes`)}>
          <ArrowLeft className="h-4 w-4" /> Volver a exámenes
        </Button>
      </div>
    );
  }

  const preguntas: any[] = examen?.preguntas ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/materias/${materiaId}/examenes`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Respondiendo</p>
            <h1 className="font-display font-semibold truncate">{examen?.title}</h1>
          </div>
          {tiempoRestante !== null && (
            <div className={cn("flex items-center gap-1.5 font-mono text-sm px-3 py-1 rounded-full border", tiempoRestante < 300 ? "bg-red-50 border-red-300 text-red-600" : "bg-secondary border-border text-foreground")}>
              <Clock className="h-3.5 w-3.5" />
              {formatTime(tiempoRestante)}
            </div>
          )}
          <Badge variant="outline">{Object.keys(respuestas).length}/{preguntas.length}</Badge>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {preguntas.map((p: any, idx: number) => {
          const resp = respuestas[p.id] ?? {};
          const isSaving = savingId === p.id;

          return (
            <div key={p.id} className={cn("bg-card border rounded-2xl p-6", isSaving ? "border-accent/50" : "border-border")}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs text-muted-foreground">Pregunta {idx + 1}</span>
                  <p className="font-medium mt-0.5">{p.tipo === "completar_espacios" ? undefined : p.enunciado}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{p.puntaje} pts</Badge>
              </div>

              {/* opcion_multiple */}
              {(p.tipo === "opcion_multiple" || p.tipo === "multiple_choice") && (
                <RadioGroup value={resp.opcion_id?.toString() ?? ""} onValueChange={v => setResp(p.id, { opcion_id: parseInt(v) })}>
                  <div className="space-y-2">
                    {(p.opciones ?? []).map((op: any) => (
                      <label key={op.id} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-smooth", resp.opcion_id === op.id ? "border-accent bg-accent/5" : "border-border hover:bg-secondary/50")}>
                        <RadioGroupItem value={op.id.toString()} id={`op-${op.id}`} />
                        <span className="text-sm">{op.texto}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* multiple_correctas */}
              {p.tipo === "multiple_correctas" && (
                <div className="space-y-2">
                  {(p.opciones ?? []).map((op: any) => {
                    const checked = (resp.respuesta_extra?.opciones_ids ?? []).includes(op.id);
                    return (
                      <label key={op.id} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-smooth", checked ? "border-accent bg-accent/5" : "border-border hover:bg-secondary/50")}>
                        <Checkbox checked={checked} onCheckedChange={(c) => {
                          const ids = [...(resp.respuesta_extra?.opciones_ids ?? [])];
                          setResp(p.id, { respuesta_extra: { opciones_ids: c ? [...ids, op.id] : ids.filter(id => id !== op.id) } });
                        }} />
                        <span className="text-sm">{op.texto}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* verdadero_falso */}
              {p.tipo === "verdadero_falso" && (
                <div className="flex gap-3">
                  {(p.opciones ?? []).map((op: any) => (
                    <button key={op.id} onClick={() => setResp(p.id, { opcion_id: op.id })}
                      className={cn("flex-1 py-3 rounded-xl border text-sm font-medium transition-smooth", resp.opcion_id === op.id ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-secondary")}>
                      {op.texto}
                    </button>
                  ))}
                </div>
              )}

              {/* respuesta_corta */}
              {p.tipo === "respuesta_corta" && (
                <Input value={resp.texto_respuesta ?? ""} onChange={e => setResp(p.id, { texto_respuesta: e.target.value })} placeholder="Tu respuesta..." />
              )}

              {/* desarrollo */}
              {p.tipo === "desarrollo" && (
                <Textarea value={resp.texto_respuesta ?? ""} onChange={e => setResp(p.id, { texto_respuesta: e.target.value })} rows={5} placeholder="Desarrollá tu respuesta..." className="resize-none" />
              )}

              {/* completar_espacios */}
              {p.tipo === "completar_espacios" && (() => {
                const partes = p.enunciado.split("[__]");
                const blancos: string[] = resp.respuesta_extra?.blancos ?? Array(partes.length - 1).fill("");
                return (
                  <p className="leading-8">
                    {partes.map((parte: string, i: number) => (
                      <span key={i}>
                        {parte}
                        {i < partes.length - 1 && (
                          <input
                            value={blancos[i] ?? ""}
                            onChange={e => {
                              const b = [...blancos]; b[i] = e.target.value;
                              setResp(p.id, { respuesta_extra: { blancos: b } });
                            }}
                            className="inline-block mx-1 px-2 py-0.5 border-b-2 border-accent bg-accent/10 rounded text-sm min-w-24 outline-none focus:border-accent text-center"
                          />
                        )}
                      </span>
                    ))}
                  </p>
                );
              })()}

              {/* emparejar */}
              {p.tipo === "emparejar" && (() => {
                const pares = p.datos_extra?.pares ?? [];
                const derecha = pares.map((par: any) => par.derecha).sort(() => Math.random() - 0.5);
                const studentPares: any[] = resp.respuesta_extra?.pares ?? pares.map((par: any) => ({ izquierda: par.izquierda, derecha: "" }));
                return (
                  <div className="space-y-3">
                    {pares.map((par: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="flex-1 text-sm font-medium p-3 bg-secondary rounded-xl">{par.izquierda}</span>
                        <span className="text-muted-foreground">→</span>
                        <Select value={studentPares[i]?.derecha ?? ""} onValueChange={v => {
                          const newPares = studentPares.map((sp: any, j: number) => j === i ? { ...sp, derecha: v } : sp);
                          setResp(p.id, { respuesta_extra: { pares: newPares } });
                        }}>
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Seleccioná..." /></SelectTrigger>
                          <SelectContent>
                            {pares.map((pp: any) => <SelectItem key={pp.derecha} value={pp.derecha}>{pp.derecha}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ordenar */}
              {p.tipo === "ordenar" && (() => {
                const correctItems = p.datos_extra?.items ?? [];
                const currentOrden: string[] = resp.respuesta_extra?.orden ?? [...correctItems].sort(() => Math.random() - 0.5);
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Ordená los elementos usando las flechas:</p>
                    {currentOrden.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-secondary rounded-xl">
                        <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                        <span className="flex-1 text-sm">{item}</span>
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="icon" className="h-5 w-6" disabled={i === 0}
                            onClick={() => {
                              const o = [...currentOrden]; [o[i - 1], o[i]] = [o[i], o[i - 1]];
                              setResp(p.id, { respuesta_extra: { orden: o } });
                            }}>▲</Button>
                          <Button variant="ghost" size="icon" className="h-5 w-6" disabled={i === currentOrden.length - 1}
                            onClick={() => {
                              const o = [...currentOrden]; [o[i], o[i + 1]] = [o[i + 1], o[i]];
                              setResp(p.id, { respuesta_extra: { orden: o } });
                            }}>▼</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          );
        })}

        {/* Submit */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="font-medium">¿Listo para entregar?</p>
            <p className="text-sm text-muted-foreground">{Object.keys(respuestas).length} de {preguntas.length} preguntas respondidas.</p>
          </div>
          <Button variant="hero" size="lg" onClick={handleSubmit} disabled={mutSubmit.isPending}>
            <Send className="h-4 w-4" /> Entregar examen
          </Button>
        </div>
      </div>
    </div>
  );
}
