import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus, Trash2, UserCheck } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */
type EstadoAsistencia = "presente" | "ausente" | "tardanza" | "justificado";

type RegistroAsistencia = {
  id: number;
  estudiante_id: number;
  estudiante: { id: number; name: string; email: string };
  estado: EstadoAsistencia;
};

type SesionAsistencia = {
  id: number;
  fecha: string;
  descripcion: string | null;
  registros: RegistroAsistencia[];
  presentes: number;
  ausentes: number;
  tardanzas: number;
};

type ResumenAsistencia = {
  total_clases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  porcentaje_asistencia: number;
};

type EstudianteRegistro = {
  id: number;
  name: string;
  email: string;
};

/* ── Helpers ─────────────────────────────────────────────────── */
const estadoConfig: Record<EstadoAsistencia, { label: string; className: string }> = {
  presente: { label: "Presente", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" },
  ausente: { label: "Ausente", className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200" },
  tardanza: { label: "Tardanza", className: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200" },
  justificado: { label: "Justificado", className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" },
};

function EstadoBadge({ estado }: { estado: EstadoAsistencia }) {
  const cfg = estadoConfig[estado];
  return (
    <Badge className={cn("text-xs font-medium border", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

const todayDate = () => new Date().toISOString().split("T")[0];

/* ── Main component ─────────────────────────────────────────── */
export default function AsistenciaTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);
  const esEstudiante = user?.role === "estudiante";

  if (esEstudiante) return <VistaEstudiante materiaId={materiaId} />;
  return <VistaDocente materiaId={materiaId} qc={qc} />;
}

/* ── Vista Docente/Admin ─────────────────────────────────────── */
function VistaDocente({ materiaId, qc }: { materiaId: number; qc: ReturnType<typeof useQueryClient> }) {
  const { data: sesiones = [], isLoading } = useQuery({
    queryKey: ["asistencias", materiaId],
    queryFn: () => aulaService.asistencias(materiaId),
  });

  const [openCrear, setOpenCrear] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /* Mutación eliminar */
  const mutEliminar = useMutation({
    mutationFn: (asistenciaId: number) => aulaService.eliminarAsistencia(materiaId, asistenciaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asistencias", materiaId] });
      toast.success("Sesión eliminada");
    },
    onError: () => toast.error("Error al eliminar la sesión"),
  });

  /* Mutación actualizar estado individual */
  const mutActualizar = useMutation({
    mutationFn: ({ asistenciaId, registros }: { asistenciaId: number; registros: { estudiante_id: number; estado: EstadoAsistencia }[] }) =>
      aulaService.actualizarAsistencia(materiaId, asistenciaId, { registros }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asistencias", materiaId] });
    },
    onError: () => toast.error("Error al actualizar"),
  });

  const handleEstadoChange = (sesion: SesionAsistencia, estudianteId: number, nuevoEstado: EstadoAsistencia) => {
    const registrosActualizados = sesion.registros.map((r) => ({
      estudiante_id: r.estudiante_id,
      estado: r.estudiante_id === estudianteId ? nuevoEstado : r.estado,
    }));
    mutActualizar.mutate({ asistenciaId: sesion.id, registros: registrosActualizados });
  };

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Control de Asistencia</h2>
          <p className="text-sm text-muted-foreground">{(sesiones as SesionAsistencia[]).length} sesiones registradas</p>
        </div>
        <Button variant="hero" onClick={() => setOpenCrear(true)}>
          <Plus className="h-4 w-4" /> Registrar asistencia
        </Button>
      </div>

      {isLoading ? (
        <div className="h-32 bg-secondary rounded-2xl animate-pulse" />
      ) : (sesiones as SesionAsistencia[]).length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aún no hay sesiones de asistencia registradas.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {(sesiones as SesionAsistencia[]).map((sesion) => {
            const isExpanded = expandedId === sesion.id;
            return (
              <div key={sesion.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Cabecera de sesión */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleExpand(sesion.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center px-3 py-2 rounded-xl bg-secondary shrink-0">
                      <p className="font-display text-xl font-semibold leading-none">{new Date(sesion.fecha).getDate()}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        {new Date(sesion.fecha).toLocaleDateString("es-AR", { month: "short" })}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {sesion.descripcion || new Date(sesion.fecha).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          {sesion.presentes ?? (sesion.registros?.filter(r => r.estado === "presente").length ?? 0)} presentes
                        </span>
                        <span className="flex items-center gap-1 text-xs text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                          {sesion.ausentes ?? (sesion.registros?.filter(r => r.estado === "ausente").length ?? 0)} ausentes
                        </span>
                        <span className="flex items-center gap-1 text-xs text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                          {sesion.tardanzas ?? (sesion.registros?.filter(r => r.estado === "tardanza").length ?? 0)} tardanzas
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={(e) => { e.stopPropagation(); mutEliminar.mutate(sesion.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Detalle expandible */}
                {isExpanded && sesion.registros && (
                  <div className="border-t border-border">
                    <div className="divide-y divide-border">
                      {sesion.registros.map((registro) => (
                        <div key={registro.id} className="flex items-center justify-between px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                                {registro.estudiante.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{registro.estudiante.name}</p>
                              <p className="text-xs text-muted-foreground">{registro.estudiante.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            {(["presente", "ausente", "tardanza", "justificado"] as EstadoAsistencia[]).map((estado) => {
                              const cfg = estadoConfig[estado];
                              const isActive = registro.estado === estado;
                              return (
                                <button
                                  key={estado}
                                  onClick={() => handleEstadoChange(sesion, registro.estudiante_id, estado)}
                                  className={cn(
                                    "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                                    isActive
                                      ? cfg.className
                                      : "border-border text-muted-foreground hover:border-current",
                                  )}
                                >
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog registrar asistencia */}
      <DialogRegistrar
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        materiaId={materiaId}
        qc={qc}
      />
    </div>
  );
}

/* ── Dialog Registrar Asistencia ─────────────────────────────── */
function DialogRegistrar({
  open, onClose, materiaId, qc,
}: {
  open: boolean;
  onClose: () => void;
  materiaId: number;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [fecha, setFecha] = useState(todayDate());
  const [descripcion, setDescripcion] = useState("");
  const [estados, setEstados] = useState<Record<number, EstadoAsistencia>>({});

  // Para obtener la lista de estudiantes de la clase, reutilizamos el endpoint asistencias
  // Si no hay sesiones previas, usamos libro-calificaciones que devuelve los estudiantes
  const { data: libroData } = useQuery({
    queryKey: ["libro-calificaciones", materiaId],
    queryFn: () => aulaService.libroCalificaciones(materiaId),
    enabled: open,
  });

  const estudiantes: EstudianteRegistro[] = (libroData?.libro ?? []).map((e: { estudiante: EstudianteRegistro }) => e.estudiante);

  // Inicializar estados cuando cambian los estudiantes
  const initEstados = () => {
    const initial: Record<number, EstadoAsistencia> = {};
    estudiantes.forEach((e) => { initial[e.id] = "presente"; });
    setEstados(initial);
  };

  const setAll = (estado: EstadoAsistencia) => {
    const newEstados: Record<number, EstadoAsistencia> = {};
    estudiantes.forEach((e) => { newEstados[e.id] = estado; });
    setEstados(newEstados);
  };

  const mutCrear = useMutation({
    mutationFn: () => aulaService.crearAsistencia(materiaId, {
      fecha,
      descripcion: descripcion || null,
      registros: estudiantes.map((e) => ({
        estudiante_id: e.id,
        estado: estados[e.id] ?? "presente",
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asistencias", materiaId] });
      toast.success("Asistencia registrada");
      handleClose();
    },
    onError: () => toast.error("Error al registrar la asistencia"),
  });

  const handleClose = () => {
    setFecha(todayDate());
    setDescripcion("");
    setEstados({});
    onClose();
  };

  // Inicializar cuando se abre el dialog
  const handleOpen = (openState: boolean) => {
    if (openState && estudiantes.length > 0 && Object.keys(estados).length === 0) {
      initEstados();
    }
    if (!openState) handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar asistencia</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Clase 1 — Introducción"
              />
            </div>
          </div>

          {/* Toggle rápido */}
          {estudiantes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Marcar todos:</span>
              <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={() => setAll("presente")}>
                Presentes
              </Button>
              <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => setAll("ausente")}>
                Ausentes
              </Button>
            </div>
          )}

          {/* Lista de estudiantes */}
          {estudiantes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes en esta materia.</p>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estudiantes
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {estudiantes.map((estudiante) => {
                  const estadoActual = estados[estudiante.id] ?? "presente";
                  return (
                    <div key={estudiante.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {estudiante.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium truncate">{estudiante.name}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(["presente", "ausente", "tardanza", "justificado"] as EstadoAsistencia[]).map((estado) => {
                          const cfg = estadoConfig[estado];
                          const isActive = estadoActual === estado;
                          return (
                            <button
                              key={estado}
                              onClick={() => setEstados(prev => ({ ...prev, [estudiante.id]: estado }))}
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all",
                                isActive
                                  ? cfg.className
                                  : "border-border text-muted-foreground hover:border-current",
                              )}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button
              variant="hero"
              onClick={() => mutCrear.mutate()}
              disabled={!fecha || estudiantes.length === 0 || mutCrear.isPending}
            >
              {mutCrear.isPending ? "Guardando..." : "Guardar asistencia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Vista Estudiante ─────────────────────────────────────────── */
function VistaEstudiante({ materiaId }: { materiaId: number }) {
  const { data: resumen, isLoading: resumenLoading } = useQuery({
    queryKey: ["asistencia-resumen", materiaId],
    queryFn: () => aulaService.resumenAsistencia(materiaId),
  });

  const { data: sesiones = [], isLoading: sesionesLoading } = useQuery({
    queryKey: ["asistencias", materiaId],
    queryFn: () => aulaService.asistencias(materiaId),
  });

  const isLoading = resumenLoading || sesionesLoading;

  if (isLoading) return <div className="h-48 bg-secondary rounded-2xl animate-pulse" />;

  // Para el estudiante, las sesiones contienen sus propios registros
  const misSesiones = (sesiones as SesionAsistencia[]).filter(s => s.registros?.length > 0);
  const resumenData = resumen as ResumenAsistencia | undefined;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Mi asistencia</h2>
      <p className="text-sm text-muted-foreground mb-6">Registro de tu asistencia en esta materia</p>

      {misSesiones.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aún no hay registros de asistencia.</p>
        </div>
      ) : (
        <div className="max-w-2xl space-y-2.5">
          {/* Cabecera tabla */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            <span>Clase</span>
            <span className="w-28 text-center">Fecha</span>
            <span className="w-24 text-center">Estado</span>
          </div>

          {misSesiones.map((sesion) => {
            const miRegistro = sesion.registros[0];
            return (
              <div key={sesion.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3.5 rounded-xl border border-border bg-card">
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {sesion.descripcion || new Date(sesion.fecha).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {sesion.descripcion && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(sesion.fecha).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  )}
                </div>
                <div className="text-center w-28 text-xs text-muted-foreground">
                  {new Date(sesion.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="w-24 flex justify-center">
                  {miRegistro ? (
                    <EstadoBadge estado={miRegistro.estado} />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Resumen */}
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4">Resumen de asistencia</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-display font-bold text-foreground">
                  {resumenData?.total_clases ?? misSesiones.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total clases</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <p className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-400">
                  {resumenData?.presentes ?? misSesiones.filter(s => s.registros[0]?.estado === "presente").length}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Presentes</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <p className="text-2xl font-display font-bold text-red-700 dark:text-red-400">
                  {resumenData?.ausentes ?? misSesiones.filter(s => s.registros[0]?.estado === "ausente").length}
                </p>
                <p className="text-xs text-red-600 mt-0.5">Ausencias</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <p className="text-2xl font-display font-bold text-amber-700 dark:text-amber-400">
                  {resumenData?.tardanzas ?? misSesiones.filter(s => s.registros[0]?.estado === "tardanza").length}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">Tardanzas</p>
              </div>
            </div>

            {/* Barra de porcentaje */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Porcentaje de asistencia</span>
                <span className="font-semibold text-foreground">
                  {resumenData?.porcentaje_asistencia != null
                    ? `${resumenData.porcentaje_asistencia.toFixed(1)}%`
                    : misSesiones.length > 0
                      ? `${((misSesiones.filter(s => ["presente", "justificado"].includes(s.registros[0]?.estado)).length / misSesiones.length) * 100).toFixed(1)}%`
                      : "—"
                  }
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${resumenData?.porcentaje_asistencia
                      ?? (misSesiones.length > 0
                          ? (misSesiones.filter(s => ["presente", "justificado"].includes(s.registros[0]?.estado)).length / misSesiones.length) * 100
                          : 0)
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
