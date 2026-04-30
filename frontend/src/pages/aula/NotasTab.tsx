import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────── */
type RawNota = {
  id: number; tipo: string; descripcion: string;
  nota: number; puntaje_maximo: number; fecha: string;
  estudiante_id: number;
};
type LibroEntry = { estudiante: { id: number; name: string; email: string }; notas: RawNota[]; promedio: number | null };
type ColDef = { key: string; tipo: string; descripcion: string; puntaje_maximo: number; fecha: string };
type EditCell = { estudianteId: number; colKey: string; notaId: number | null; value: string };

const TIPOS = ["tarea", "examen", "control_lectura", "parcial", "final", "adicional"];
const today = () => new Date().toISOString().split("T")[0];

/* ── Helpers ─────────────────────────────────────────────────── */
function pct(nota: number, max: number) { return max > 0 ? (nota / max) * 100 : 0; }

function noteColor(nota: number, max: number) {
  const p = pct(nota, max);
  if (p >= 70) return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (p >= 50) return "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400";
  return "text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400";
}

function avgColor(prom: number | null) {
  if (prom == null) return "text-muted-foreground";
  if (prom >= 70) return "text-emerald-700 dark:text-emerald-400 font-semibold";
  if (prom >= 50) return "text-amber-700 dark:text-amber-400 font-semibold";
  return "text-red-700 dark:text-red-400 font-semibold";
}

function buildColumns(libro: LibroEntry[]): ColDef[] {
  const map = new Map<string, ColDef>();
  libro.forEach(({ notas }) => {
    notas.forEach((n) => {
      const key = `${n.tipo}__${n.descripcion}`;
      if (!map.has(key)) {
        map.set(key, { key, tipo: n.tipo, descripcion: n.descripcion, puntaje_maximo: n.puntaje_maximo, fecha: n.fecha });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/* ── Main component ─────────────────────────────────────────── */
export default function NotasTab() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const materiaId = Number(id);

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["notas", materiaId],
    queryFn: () => aulaService.notas(materiaId),
  });

  const esEstudiante = user?.role === "estudiante";
  const notasEstudiante = esEstudiante ? (rawData as RawNota[]) : [];
  const libro = !esEstudiante ? (rawData as LibroEntry[]) : [];

  if (isLoading) return <div className="h-48 bg-secondary rounded-2xl animate-pulse" />;

  if (esEstudiante) return <VistaEstudiante notas={notasEstudiante} />;
  return <VistaDocente libro={libro} materiaId={materiaId} qc={qc} />;
}

/* ── Vista estudiante ─────────────────────────────────────────── */
function VistaEstudiante({ notas }: { notas: RawNota[] }) {
  if (notas.length === 0) {
    return (
      <div>
        <h2 className="font-display text-2xl font-semibold mb-1">Mis calificaciones</h2>
        <p className="text-sm text-muted-foreground mb-6">Tus notas en esta materia</p>
        <p className="text-muted-foreground text-center py-16">Aún no tenés notas registradas.</p>
      </div>
    );
  }

  const promedio = notas.reduce((a, n) => a + pct(n.nota, n.puntaje_maximo), 0) / notas.length;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-1">Mis calificaciones</h2>
      <p className="text-sm text-muted-foreground mb-6">Tus notas en esta materia</p>

      <div className="max-w-2xl space-y-2.5">
        {/* Cabecera de tabla */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          <span>Evaluación</span>
          <span className="text-center w-20">Nota</span>
          <span className="text-center w-16">%</span>
        </div>

        {notas.map((n) => {
          const p = pct(n.nota, n.puntaje_maximo);
          return (
            <div key={n.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3.5 rounded-xl border border-border bg-card">
              <div>
                <Badge variant="outline" className="mb-1 capitalize text-[10px]">{n.tipo.replace("_", " ")}</Badge>
                <p className="font-medium text-sm text-foreground">{n.descripcion}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(n.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className={cn("text-center w-20 rounded-lg py-1.5 text-sm font-semibold", noteColor(n.nota, n.puntaje_maximo))}>
                {n.nota}<span className="text-xs opacity-60">/{n.puntaje_maximo}</span>
              </div>
              <div className="text-center w-16 text-sm font-medium text-muted-foreground">
                {p.toFixed(0)}%
              </div>
            </div>
          );
        })}

        {/* Promedio */}
        <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-hero text-primary-foreground mt-4">
          <p className="font-display text-base font-medium">Promedio general</p>
          <p className="font-display text-2xl font-bold">{promedio.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

/* ── Vista docente - planilla tipo Excel ──────────────────────── */
function VistaDocente({ libro, materiaId, qc }: { libro: LibroEntry[]; materiaId: number; qc: ReturnType<typeof useQueryClient> }) {
  const columns = buildColumns(libro);
  const [editCell, setEditCell] = useState<EditCell | null>(null);
  const [newColOpen, setNewColOpen] = useState(false);
  const [newColForm, setNewColForm] = useState({ tipo: "parcial", descripcion: "", puntaje_maximo: "10", fecha: today() });
  const [newColNotas, setNewColNotas] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Mutations ── */
  const crearMut = useMutation({
    mutationFn: (data: object) => aulaService.crearNota(materiaId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notas", materiaId] }),
    onError: () => toast.error("Error al guardar la nota"),
  });

  const actualizarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => aulaService.actualizarNota(materiaId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notas", materiaId] }),
    onError: () => toast.error("Error al actualizar la nota"),
  });

  const eliminarMut = useMutation({
    mutationFn: (id: number) => aulaService.eliminarNota(materiaId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notas", materiaId] }),
    onError: () => toast.error("Error al eliminar la nota"),
  });

  /* ── Cell helpers ── */
  const findNota = (entry: LibroEntry, colKey: string): RawNota | null => {
    const [tipo, descripcion] = colKey.split("__");
    return entry.notas.find((n) => n.tipo === tipo && n.descripcion === descripcion) ?? null;
  };

  const saveCell = (cell: EditCell, col: ColDef) => {
    const val = parseFloat(cell.value);
    if (isNaN(val) || cell.value.trim() === "") {
      setEditCell(null);
      return;
    }
    if (cell.notaId) {
      actualizarMut.mutate({ id: cell.notaId, data: { nota: val } });
    } else {
      crearMut.mutate({
        estudiante_id: cell.estudianteId,
        tipo: col.tipo, descripcion: col.descripcion,
        puntaje_maximo: col.puntaje_maximo, fecha: col.fecha,
        nota: val,
      });
    }
    setEditCell(null);
  };

  const startEdit = (entry: LibroEntry, col: ColDef) => {
    const nota = findNota(entry, col.key);
    setEditCell({
      estudianteId: entry.estudiante.id, colKey: col.key,
      notaId: nota?.id ?? null, value: nota ? String(nota.nota) : "",
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ── Nueva evaluación (nueva columna) ── */
  const saveNewCol = async () => {
    const entries = Object.entries(newColNotas).filter(([, v]) => v.trim() !== "");
    if (entries.length === 0) { toast.error("Ingresá al menos una nota"); return; }

    const puntajeMax = Number(newColForm.puntaje_maximo);
    for (const [estId, val] of entries) {
      const v = parseFloat(val);
      if (!isNaN(v)) {
        await aulaService.crearNota(materiaId, {
          estudiante_id: Number(estId),
          tipo: newColForm.tipo, descripcion: newColForm.descripcion,
          puntaje_maximo: puntajeMax, fecha: newColForm.fecha, nota: v,
        });
      }
    }

    qc.invalidateQueries({ queryKey: ["notas", materiaId] });
    setNewColOpen(false);
    setNewColForm({ tipo: "parcial", descripcion: "", puntaje_maximo: "10", fecha: today() });
    setNewColNotas({});
    toast.success("Evaluación registrada");
  };

  /* ── Promedios por columna ── */
  const colAverages = columns.map((col) => {
    const vals = libro
      .map((e) => findNota(e, col.key))
      .filter(Boolean)
      .map((n) => pct(n!.nota, n!.puntaje_maximo));
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });

  const promedioGeneral = libro.length > 0
    ? libro.reduce((a, e) => a + (e.promedio ?? 0), 0) / libro.filter((e) => e.promedio != null).length
    : null;

  /* ── Render ── */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Libro de calificaciones</h2>
          <p className="text-sm text-muted-foreground">{libro.length} estudiante{libro.length !== 1 ? "s" : ""} inscripto{libro.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="hero" onClick={() => setNewColOpen(true)}>
          <Plus className="h-4 w-4" /> Nueva evaluación
        </Button>
      </div>

      {libro.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground rounded-2xl border border-dashed border-border">
          No hay estudiantes inscriptos en esta materia.
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: `${Math.max(600, 220 + columns.length * 110)}px` }}>

              {/* ── Header ── */}
              <thead>
                <tr className="bg-secondary/60">
                  {/* Columna nombre */}
                  <th className="sticky left-0 z-20 bg-secondary/60 text-left px-4 py-3 font-medium text-muted-foreground border-b border-r border-border text-xs uppercase tracking-wider min-w-[200px]">
                    Estudiante
                  </th>
                  {/* Columnas de evaluaciones */}
                  {columns.map((col) => (
                    <th key={col.key} className="px-3 py-2 border-b border-r border-border text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <Badge variant="outline" className="text-[9px] capitalize mb-0.5 px-1.5 py-0">
                          {col.tipo.replace("_", " ")}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground leading-tight">{col.descripcion}</span>
                        <span className="text-[10px] text-muted-foreground">/{col.puntaje_maximo} pts</span>
                      </div>
                    </th>
                  ))}
                  {/* Promedio */}
                  <th className="sticky right-0 z-20 bg-secondary/60 px-4 py-3 border-b border-border text-center min-w-[90px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promedio</span>
                  </th>
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody>
                {libro.map((entry, ri) => (
                  <tr key={entry.estudiante.id} className="group hover:bg-secondary/20 transition-colors">
                    {/* Nombre estudiante */}
                    <td className="sticky left-0 z-10 bg-card group-hover:bg-secondary/20 px-4 py-2.5 border-b border-r border-border">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {entry.estudiante.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-xs truncate">{entry.estudiante.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{entry.estudiante.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Celdas de notas */}
                    {columns.map((col) => {
                      const nota = findNota(entry, col.key);
                      const isEditing = editCell?.estudianteId === entry.estudiante.id && editCell?.colKey === col.key;

                      return (
                        <td
                          key={col.key}
                          className="border-b border-r border-border text-center p-0 relative"
                          onClick={() => !isEditing && startEdit(entry, col)}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="number"
                              min="0"
                              max={col.puntaje_maximo}
                              step="0.5"
                              value={editCell.value}
                              onChange={(e) => setEditCell((c) => c ? { ...c, value: e.target.value } : c)}
                              onBlur={() => saveCell(editCell, col)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveCell(editCell, col);
                                if (e.key === "Escape") setEditCell(null);
                                if (e.key === "Tab") { e.preventDefault(); saveCell(editCell, col); }
                              }}
                              className="w-full h-full absolute inset-0 text-center text-sm font-semibold bg-primary/5 border-2 border-primary rounded-none outline-none px-2"
                            />
                          ) : nota ? (
                            <div className="group/cell relative px-2 py-2.5 cursor-pointer hover:bg-secondary/30">
                              <span className={cn("inline-flex items-center justify-center min-w-[52px] px-2 py-1 rounded-md text-xs font-semibold", noteColor(nota.nota, nota.puntaje_maximo))}>
                                {nota.nota}<span className="opacity-50 font-normal">/{col.puntaje_maximo}</span>
                              </span>
                              <button
                                className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); eliminarMut.mutate(nota.id); }}
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="px-2 py-2.5 cursor-pointer hover:bg-secondary/30">
                              <span className="text-muted-foreground/30 text-lg select-none">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Promedio del estudiante */}
                    <td className="sticky right-0 z-10 bg-card group-hover:bg-secondary/20 border-b border-border text-center px-3 py-2.5">
                      {entry.promedio != null ? (
                        <span className={cn("text-sm", avgColor(entry.promedio))}>
                          {entry.promedio.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* ── Fila promedio clase ── */}
                <tr className="bg-secondary/40 font-medium">
                  <td className="sticky left-0 z-10 bg-secondary/60 px-4 py-2.5 border-t-2 border-border text-xs text-muted-foreground uppercase tracking-wider">
                    Promedio clase
                  </td>
                  {colAverages.map((avg, i) => (
                    <td key={columns[i].key} className="border-t-2 border-border text-center px-3 py-2.5">
                      {avg != null ? (
                        <span className={cn("text-xs", avgColor(avg))}>
                          {avg.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </td>
                  ))}
                  <td className="sticky right-0 z-10 bg-secondary/60 border-t-2 border-border text-center px-3 py-2.5">
                    {promedioGeneral != null ? (
                      <span className={cn("text-sm", avgColor(promedioGeneral))}>
                        {promedioGeneral.toFixed(1)}%
                      </span>
                    ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dialog: nueva evaluación ── */}
      <Dialog open={newColOpen} onOpenChange={setNewColOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva evaluación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={newColForm.tipo} onValueChange={(v) => setNewColForm((f) => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Puntaje máximo</Label>
                <Input
                  type="number" min="1"
                  value={newColForm.puntaje_maximo}
                  onChange={(e) => setNewColForm((f) => ({ ...f, puntaje_maximo: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Nombre de la evaluación</Label>
                <Input
                  value={newColForm.descripcion}
                  onChange={(e) => setNewColForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej: Parcial Unidad 1, Tarea 2…"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Fecha</Label>
                <Input type="date" value={newColForm.fecha} onChange={(e) => setNewColForm((f) => ({ ...f, fecha: e.target.value }))} />
              </div>
            </div>

            {/* Notas por estudiante */}
            {libro.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-secondary/50 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex justify-between">
                  <span>Estudiante</span>
                  <span>Nota (opcional)</span>
                </div>
                <div className="divide-y divide-border max-h-64 overflow-y-auto">
                  {libro.map((entry) => (
                    <div key={entry.estudiante.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {entry.estudiante.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium truncate">{entry.estudiante.name}</p>
                      </div>
                      <Input
                        type="number" min="0" max={newColForm.puntaje_maximo} step="0.5"
                        placeholder="—"
                        className="w-20 text-center h-8 text-sm"
                        value={newColNotas[entry.estudiante.id] ?? ""}
                        onChange={(e) => setNewColNotas((prev) => ({ ...prev, [entry.estudiante.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewColOpen(false); setNewColNotas({}); }}>Cancelar</Button>
            <Button
              variant="hero"
              onClick={saveNewCol}
              disabled={!newColForm.descripcion.trim() || !newColForm.puntaje_maximo || crearMut.isPending}
            >
              {crearMut.isPending ? "Guardando..." : "Guardar evaluación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
