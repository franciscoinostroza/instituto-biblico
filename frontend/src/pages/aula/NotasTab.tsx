import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const TIPOS_NOTA = ["tarea", "examen", "control_lectura", "parcial", "final", "adicional"];

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

  // Estudiante: array plano de notas
  // Docente: array de {estudiante, notas, promedio}
  const notasEstudiante = esEstudiante ? (rawData as any[]) : [];
  const libro = !esEstudiante ? (rawData as any[]) : [];

  // Form crear nota (docente)
  const [open, setOpen] = useState(false);
  const [notaForm, setNotaForm] = useState({
    estudiante_id: "", tipo: "tarea", descripcion: "", nota: "", puntaje_maximo: "10", fecha: new Date().toISOString().split("T")[0],
  });

  const mutation = useMutation({
    mutationFn: () => aulaService.crearNota(materiaId, {
      ...notaForm,
      estudiante_id: Number(notaForm.estudiante_id),
      nota: Number(notaForm.nota),
      puntaje_maximo: Number(notaForm.puntaje_maximo),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notas", materiaId] });
      toast.success("Nota registrada");
      setOpen(false);
      setNotaForm({ estudiante_id: "", tipo: "tarea", descripcion: "", nota: "", puntaje_maximo: "10", fecha: new Date().toISOString().split("T")[0] });
    },
    onError: () => toast.error("Error al registrar la nota"),
  });

  if (isLoading) return <div className="h-48 bg-secondary rounded-2xl animate-pulse" />;

  // Vista estudiante
  if (esEstudiante) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold">Mis notas</h2>
          <p className="text-sm text-muted-foreground">Tus calificaciones en esta materia</p>
        </div>
        <div className="max-w-2xl space-y-3">
          {notasEstudiante.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Aún no tenés notas registradas.</p>
          ) : (
            <>
              {notasEstudiante.map((n: any) => (
                <div key={n.id} className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
                  <div>
                    <Badge variant="outline" className="mb-2 capitalize">{n.tipo?.replace("_", " ")}</Badge>
                    <p className="font-medium text-foreground">{n.descripcion}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-semibold text-foreground">{n.nota}<span className="text-base text-muted-foreground">/{n.puntaje_maximo}</span></p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-hero text-primary-foreground mt-6">
                <p className="font-display text-lg">Promedio actual</p>
                <p className="font-display text-3xl font-semibold">
                  {(notasEstudiante.reduce((a: number, n: any) => a + (n.nota / n.puntaje_maximo) * 100, 0) / notasEstudiante.length).toFixed(1)}%
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Vista docente (libro de calificaciones)
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Libro de calificaciones</h2>
          <p className="text-sm text-muted-foreground">{libro.length} estudiantes inscriptos</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar nota
        </Button>
      </div>

      {libro.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No hay estudiantes inscriptos o aún no hay notas.</p>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {libro.map((entry: any) => (
            <div key={entry.estudiante.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-secondary text-xs">{entry.estudiante.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{entry.estudiante.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.estudiante.email}</p>
                  </div>
                </div>
                {entry.promedio != null && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-sm px-3 py-1">
                    {entry.promedio}%
                  </Badge>
                )}
              </div>
              {entry.notas?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {entry.notas.map((n: any) => (
                    <div key={n.id} className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border">
                      <span className="capitalize text-muted-foreground">{n.tipo?.replace("_", " ")}</span>
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span className="font-medium text-foreground">{n.nota}/{n.puntaje_maximo}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin notas aún</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Registrar nota</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Estudiante</Label>
              <Select value={notaForm.estudiante_id} onValueChange={v => setNotaForm(f => ({ ...f, estudiante_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccioná un estudiante" /></SelectTrigger>
                <SelectContent>
                  {libro.map((e: any) => (
                    <SelectItem key={e.estudiante.id} value={String(e.estudiante.id)}>{e.estudiante.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={notaForm.tipo} onValueChange={v => setNotaForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_NOTA.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={notaForm.descripcion} onChange={e => setNotaForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Ej: Parcial Unidad 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nota</Label>
                <Input type="number" min="0" value={notaForm.nota} onChange={e => setNotaForm(f => ({ ...f, nota: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Puntaje máximo</Label>
                <Input type="number" min="1" value={notaForm.puntaje_maximo} onChange={e => setNotaForm(f => ({ ...f, puntaje_maximo: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={notaForm.fecha} onChange={e => setNotaForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={() => mutation.mutate()} disabled={!notaForm.estudiante_id || !notaForm.descripcion || !notaForm.nota || mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
