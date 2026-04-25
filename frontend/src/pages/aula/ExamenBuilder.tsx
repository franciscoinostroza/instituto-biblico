import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Plus, Trash2, Edit2, GripVertical,
  Radio, CheckSquare, ToggleLeft, Type, AlignLeft, PenLine, Shuffle, ListOrdered,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { aulaService } from "@/services/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIPOS = [
  { value: "opcion_multiple",    label: "Opción múltiple (una correcta)",     icon: Radio },
  { value: "multiple_correctas", label: "Múltiples respuestas correctas",      icon: CheckSquare },
  { value: "verdadero_falso",    label: "Verdadero / Falso",                   icon: ToggleLeft },
  { value: "respuesta_corta",    label: "Respuesta corta",                     icon: Type },
  { value: "desarrollo",         label: "Desarrollo / Ensayo",                 icon: AlignLeft },
  { value: "completar_espacios", label: "Completar espacios  ( use [__] )",    icon: PenLine },
  { value: "emparejar",          label: "Emparejar columnas",                  icon: Shuffle },
  { value: "ordenar",            label: "Ordenar elementos",                   icon: ListOrdered },
] as const;

type TipoPregunta = typeof TIPOS[number]["value"];

interface Opcion { texto: string; es_correcta: boolean; }
interface Par     { izquierda: string; derecha: string; }

interface FormState {
  enunciado: string;
  tipo: TipoPregunta;
  puntaje: string;
  opciones: Opcion[];
  verdaderoFalsoCorrecta: "verdadero" | "falso";
  respuestaEsperada: string;
  blancos: string[];
  pares: Par[];
  items: string[];
}

const defaultForm = (): FormState => ({
  enunciado: "",
  tipo: "opcion_multiple",
  puntaje: "1",
  opciones: [{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }],
  verdaderoFalsoCorrecta: "verdadero",
  respuestaEsperada: "",
  blancos: [""],
  pares: [{ izquierda: "", derecha: "" }],
  items: ["", ""],
});

function parseBlancos(enunciado: string, currentBlancos: string[]): string[] {
  const matches = (enunciado.match(/\[__\]/g) ?? []).length;
  const blancos = [...currentBlancos];
  while (blancos.length < matches) blancos.push("");
  return blancos.slice(0, matches);
}

export default function ExamenBuilder() {
  const { id: materiaId, examenId } = useParams<{ id: string; examenId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());

  const { data: examen, isLoading } = useQuery({
    queryKey: ["examen", materiaId, examenId],
    queryFn: () => aulaService.getExamen(Number(materiaId), Number(examenId)),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["examen", materiaId, examenId] });

  const mutCrear = useMutation({
    mutationFn: (data: object) => aulaService.crearPregunta(Number(materiaId), Number(examenId), data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast.success("Pregunta creada"); },
    onError: () => toast.error("Error al crear pregunta"),
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) =>
      aulaService.updatePregunta(Number(materiaId), Number(examenId), id, data),
    onSuccess: () => { invalidate(); setDialogOpen(false); toast.success("Pregunta actualizada"); },
    onError: () => toast.error("Error al actualizar"),
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => aulaService.deletePregunta(Number(materiaId), Number(examenId), id),
    onSuccess: () => { invalidate(); toast.success("Pregunta eliminada"); },
    onError: () => toast.error("Error al eliminar"),
  });

  const openNew = () => { setEditingId(null); setForm(defaultForm()); setDialogOpen(true); };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    const extras = p.datos_extra ?? {};
    setForm({
      enunciado: p.enunciado ?? "",
      tipo: p.tipo,
      puntaje: String(p.puntaje ?? 1),
      opciones: p.opciones?.length ? p.opciones.map((o: any) => ({ texto: o.texto, es_correcta: o.es_correcta })) : defaultForm().opciones,
      verdaderoFalsoCorrecta: p.opciones?.find((o: any) => o.es_correcta)?.texto?.toLowerCase() === "verdadero" ? "verdadero" : "falso",
      respuestaEsperada: extras.respuesta_esperada ?? "",
      blancos: extras.blancos ?? [""],
      pares: extras.pares ?? [{ izquierda: "", derecha: "" }],
      items: extras.items ?? ["", ""],
    });
    setDialogOpen(true);
  };

  const buildPayload = () => {
    const base = { enunciado: form.enunciado, tipo: form.tipo, puntaje: parseFloat(form.puntaje) || 1 };

    if (form.tipo === "opcion_multiple" || form.tipo === "multiple_correctas") {
      return { ...base, opciones: form.opciones.filter(o => o.texto.trim()) };
    }
    if (form.tipo === "verdadero_falso") {
      return {
        ...base,
        opciones: [
          { texto: "Verdadero", es_correcta: form.verdaderoFalsoCorrecta === "verdadero" },
          { texto: "Falso",     es_correcta: form.verdaderoFalsoCorrecta === "falso"     },
        ],
      };
    }
    if (form.tipo === "respuesta_corta") {
      return { ...base, datos_extra: form.respuestaEsperada ? { respuesta_esperada: form.respuestaEsperada } : null };
    }
    if (form.tipo === "completar_espacios") {
      return { ...base, datos_extra: { blancos: form.blancos } };
    }
    if (form.tipo === "emparejar") {
      return { ...base, datos_extra: { pares: form.pares.filter(p => p.izquierda.trim() && p.derecha.trim()) } };
    }
    if (form.tipo === "ordenar") {
      return { ...base, datos_extra: { items: form.items.filter(i => i.trim()) } };
    }
    return base;
  };

  const handleSubmit = () => {
    if (!form.enunciado.trim()) { toast.error("El enunciado es requerido"); return; }
    const payload = buildPayload();
    if (editingId) {
      mutActualizar.mutate({ id: editingId, data: payload });
    } else {
      mutCrear.mutate(payload);
    }
  };

  const setOpcionTexto = (i: number, texto: string) =>
    setForm(f => ({ ...f, opciones: f.opciones.map((o, j) => j === i ? { ...o, texto } : o) }));

  const setOpcionCorrecta = (i: number, checked: boolean) =>
    setForm(f => ({
      ...f,
      opciones: f.tipo === "opcion_multiple"
        ? f.opciones.map((o, j) => ({ ...o, es_correcta: j === i ? checked : false }))
        : f.opciones.map((o, j) => j === i ? { ...o, es_correcta: checked } : o),
    }));

  // actualizar blancos cuando cambia enunciado
  const handleEnunciadoChange = (v: string) => {
    setForm(f => ({
      ...f,
      enunciado: v,
      blancos: f.tipo === "completar_espacios" ? parseBlancos(v, f.blancos) : f.blancos,
    }));
  };

  const preguntas: any[] = examen?.preguntas ?? [];
  const totalPuntos = preguntas.reduce((s: number, p: any) => s + (parseFloat(p.puntaje) || 0), 0);

  if (isLoading) return <div className="container mx-auto p-8"><div className="h-32 bg-secondary rounded-2xl animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/materias/${materiaId}/examenes`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Constructor de examen</p>
            <h1 className="font-display font-semibold truncate">{examen?.title ?? "..."}</h1>
          </div>
          <Badge variant="secondary">{preguntas.length} preg. · {totalPuntos} pts</Badge>
          <Button variant="hero" size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> Agregar pregunta
          </Button>
        </div>
      </div>

      {/* Question list */}
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-3">
        {preguntas.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
            <ListOrdered className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aún no hay preguntas. Agregá la primera.</p>
            <Button variant="outline" className="mt-4" onClick={openNew}><Plus className="h-4 w-4" /> Primera pregunta</Button>
          </div>
        ) : (
          preguntas.map((p: any, idx: number) => {
            const tipoInfo = TIPOS.find(t => t.value === p.tipo);
            const Icon = tipoInfo?.icon ?? Radio;
            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3 group">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className="text-xs text-muted-foreground font-mono w-6 text-center">{idx + 1}</span>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{tipoInfo?.label}</span>
                    <Badge variant="outline" className="text-xs ml-auto">{p.puntaje} pts</Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{p.enunciado}</p>
                  {p.opciones?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.opciones.map((o: any) => (
                        <span key={o.id} className={cn("text-xs px-2 py-0.5 rounded-full border", o.es_correcta ? "bg-green-50 border-green-300 text-green-700" : "bg-secondary border-border text-muted-foreground")}>
                          {o.texto}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => mutEliminar.mutate(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar pregunta" : "Nueva pregunta"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Type selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Tipo de pregunta</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm(f => ({ ...f, tipo: v as TipoPregunta }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Enunciado */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Enunciado {form.tipo === "completar_espacios" && <span className="text-accent ml-1">— usá [__] para marcar los espacios</span>}
              </Label>
              <Textarea value={form.enunciado} onChange={e => handleEnunciadoChange(e.target.value)} rows={3} placeholder="Escribí la pregunta aquí..." className="resize-none" />
            </div>

            {/* Points */}
            <div className="w-32">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Puntaje</Label>
              <Input type="number" min={0} step={0.5} value={form.puntaje} onChange={e => setForm(f => ({ ...f, puntaje: e.target.value }))} />
            </div>

            {/* Options for opcion_multiple / multiple_correctas */}
            {(form.tipo === "opcion_multiple" || form.tipo === "multiple_correctas") && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Opciones {form.tipo === "opcion_multiple" ? "(marcá la correcta)" : "(marcá todas las correctas)"}
                </Label>
                <div className="space-y-2">
                  {form.opciones.map((op, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Checkbox
                        checked={op.es_correcta}
                        onCheckedChange={(c) => setOpcionCorrecta(i, !!c)}
                        className={op.es_correcta ? "border-green-500 data-[state=checked]:bg-green-500" : ""}
                      />
                      <Input value={op.texto} onChange={e => setOpcionTexto(i, e.target.value)} placeholder={`Opción ${i + 1}`} className="flex-1" />
                      {form.opciones.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0"
                          onClick={() => setForm(f => ({ ...f, opciones: f.opciones.filter((_, j) => j !== i) }))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, opciones: [...f.opciones, { texto: "", es_correcta: false }] }))}>
                    <Plus className="h-3.5 w-3.5" /> Agregar opción
                  </Button>
                </div>
              </div>
            )}

            {/* Verdadero / Falso */}
            {form.tipo === "verdadero_falso" && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Respuesta correcta</Label>
                <div className="flex gap-3">
                  {(["verdadero", "falso"] as const).map(v => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, verdaderoFalsoCorrecta: v }))}
                      className={cn("flex-1 py-2 rounded-lg border text-sm font-medium transition-smooth capitalize", form.verdaderoFalsoCorrecta === v ? "bg-green-500 border-green-500 text-white" : "border-border text-muted-foreground hover:bg-secondary")}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Respuesta corta */}
            {form.tipo === "respuesta_corta" && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Respuesta esperada (opcional — para auto-corrección)</Label>
                <Input value={form.respuestaEsperada} onChange={e => setForm(f => ({ ...f, respuestaEsperada: e.target.value }))} placeholder="Dejá vacío para corrección manual" />
              </div>
            )}

            {/* Completar espacios */}
            {form.tipo === "completar_espacios" && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Respuestas correctas para cada [__] ({form.blancos.length} espacio{form.blancos.length !== 1 ? "s" : ""} detectado{form.blancos.length !== 1 ? "s" : ""})
                </Label>
                {form.blancos.length === 0 && <p className="text-xs text-muted-foreground">Escribí [__] en el enunciado para definir los espacios.</p>}
                {form.blancos.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0">Espacio {i + 1}</span>
                    <Input value={b} onChange={e => setForm(f => ({ ...f, blancos: f.blancos.map((x, j) => j === i ? e.target.value : x) }))} placeholder="Respuesta correcta" />
                  </div>
                ))}
              </div>
            )}

            {/* Emparejar */}
            {form.tipo === "emparejar" && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Pares (Columna A ↔ Columna B)</Label>
                <div className="space-y-2">
                  {form.pares.map((par, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={par.izquierda} onChange={e => setForm(f => ({ ...f, pares: f.pares.map((p, j) => j === i ? { ...p, izquierda: e.target.value } : p) }))} placeholder="Columna A" className="flex-1" />
                      <span className="text-muted-foreground">↔</span>
                      <Input value={par.derecha} onChange={e => setForm(f => ({ ...f, pares: f.pares.map((p, j) => j === i ? { ...p, derecha: e.target.value } : p) }))} placeholder="Columna B" className="flex-1" />
                      {form.pares.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(f => ({ ...f, pares: f.pares.filter((_, j) => j !== i) }))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, pares: [...f.pares, { izquierda: "", derecha: "" }] }))}>
                    <Plus className="h-3.5 w-3.5" /> Agregar par
                  </Button>
                </div>
              </div>
            )}

            {/* Ordenar */}
            {form.tipo === "ordenar" && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Elementos en el orden correcto</Label>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6 text-center">{i + 1}.</span>
                      <Input value={item} onChange={e => setForm(f => ({ ...f, items: f.items.map((x, j) => j === i ? e.target.value : x) }))} placeholder={`Elemento ${i + 1}`} className="flex-1" />
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="h-5 w-6" disabled={i === 0}
                          onClick={() => setForm(f => { const items = [...f.items]; [items[i - 1], items[i]] = [items[i], items[i - 1]]; return { ...f, items }; })}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-6" disabled={i === form.items.length - 1}
                          onClick={() => setForm(f => { const items = [...f.items]; [items[i], items[i + 1]] = [items[i + 1], items[i]]; return { ...f, items }; })}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      {form.items.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, items: [...f.items, ""] }))}>
                    <Plus className="h-3.5 w-3.5" /> Agregar elemento
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={handleSubmit} disabled={mutCrear.isPending || mutActualizar.isPending}>
                {editingId ? "Guardar cambios" : "Crear pregunta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
