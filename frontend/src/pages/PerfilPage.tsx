import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  User as UserIcon, Shield, GraduationCap, CreditCard,
  Pencil, Check, X, Eye, EyeOff, ChevronDown, ChevronUp,
  Phone, Mail, BookOpen, MessageSquare, Calendar,
} from "lucide-react";
import { authService, perfilService, materiasService } from "@/services/endpoints";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── helpers ─────────────────────────────────────────────── */
const rolLabels: Record<string, string> = {
  admin: "Administrador", docente: "Docente",
  estudiante: "Estudiante", editor: "Editor",
};
const rolChip: Record<string, string> = {
  admin:      "bg-role-admin/10 text-role-admin border-role-admin/20",
  docente:    "bg-role-docente/10 text-role-docente border-role-docente/20",
  estudiante: "bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20",
  editor:     "bg-role-editor/10 text-role-editor border-role-editor/20",
};

function passwordStrength(pwd: string): { label: string; color: string; width: string } {
  if (!pwd) return { label: "", color: "", width: "w-0" };
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum   = /[0-9]/.test(pwd);
  const hasSpec  = /[^A-Za-z0-9]/.test(pwd);
  const score    = (pwd.length >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpec ? 1 : 0);
  if (score <= 1) return { label: "Débil",  color: "bg-red-500",   width: "w-1/4" };
  if (score === 2) return { label: "Media",  color: "bg-amber-500", width: "w-2/4" };
  if (score === 3) return { label: "Buena",  color: "bg-blue-500",  width: "w-3/4" };
  return              { label: "Fuerte", color: "bg-green-500", width: "w-full" };
}

/* ─── page ─────────────────────────────────────────────────── */
export default function PerfilPage() {
  const { user, setUser } = useAuthStore();

  // Refresca datos del usuario al cargar el perfil
  useQuery({
    queryKey: ["perfil-me"],
    queryFn: authService.me,
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
    select: (data) => { setUser(data); return data; },
  });

  if (!user) return null;

  const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Identity header ─────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        <Avatar className="h-16 w-16 shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="rounded-full object-cover" />
            : null}
          <AvatarFallback className="bg-gradient-hero text-primary-foreground font-semibold text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-semibold truncate">{user.name}</h1>
            <Badge variant="outline" className={cn("text-xs", rolChip[user.role])}>
              {rolLabels[user.role] ?? user.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />{user.email}
          </p>
          {(user as any).created_at && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Miembro desde {new Date((user as any).created_at).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* ── Dos columnas: datos + seguridad ─────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <DatosPersonalesCard />
        <SeguridadCard />
      </div>

      {/* ── Info académica (solo estudiante) ────────────────── */}
      {user.role === "estudiante" && <InfoAcademicaCard />}

      {/* ── Estado de cuenta ────────────────────────────────── */}
      <EstadoCuentaCard />
    </div>
  );
}

/* ─── Datos personales ─────────────────────────────────────── */
function DatosPersonalesCard() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });

  useEffect(() => {
    if (!editing) setForm({ name: user?.name ?? "", phone: user?.phone ?? "" });
  }, [user?.name, user?.phone, editing]);

  const mut = useMutation({
    mutationFn: () => perfilService.updateDatos({ name: form.name, phone: form.phone }),
    onSuccess: (updated) => {
      setUser(updated);
      setEditing(false);
      toast.success("Datos actualizados");
    },
    onError: () => toast.error("Error al guardar"),
  });

  const handleEdit = () => {
    setForm({ name: user?.name ?? "", phone: user?.phone ?? "" });
    setEditing(true);
  };
  const handleCancel = () => setEditing(false);

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <SectionHeader
        icon={UserIcon} title="Datos personales"
        action={
          editing ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={handleCancel} disabled={mut.isPending}>
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => mut.mutate()} disabled={!form.name.trim() || mut.isPending}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )
        }
      />

      <div className="space-y-4 mt-4">
        {editing ? (
          <>
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54 9 11 ..." type="tel" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Email</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user?.email}</span>
                <span className="ml-auto text-[10px] bg-muted rounded px-1.5 py-0.5">Solo lectura</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <DataRow icon={UserIcon} label="Nombre" value={user?.name} />
            <DataRow icon={Phone}    label="Teléfono" value={user?.phone ?? "—"} />
            <DataRow icon={Mail}     label="Email" value={user?.email} muted />
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Seguridad ────────────────────────────────────────────── */
function SeguridadCard() {
  const { setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState({ cur: false, new: false, conf: false });
  const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const strength = passwordStrength(form.password);

  const mut = useMutation({
    mutationFn: () => perfilService.updatePassword(form),
    onSuccess: (updated) => {
      setUser(updated);
      setOpen(false);
      setForm({ current_password: "", password: "", password_confirmation: "" });
      toast.success("Contraseña actualizada");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.errors?.current_password?.[0]
        ?? err?.response?.data?.message
        ?? "Error al cambiar la contraseña";
      toast.error(msg);
    },
  });

  const valid = form.current_password && form.password.length >= 8 && form.password === form.password_confirmation;

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <SectionHeader icon={Shield} title="Seguridad" />

      <div className="mt-4">
        {/* Trigger row */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-smooth group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-card">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Contraseña</p>
              <p className="text-xs text-muted-foreground">••••••••</p>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {/* Expand form */}
        {open && (
          <div className="mt-3 space-y-3 border-t border-border pt-4">
            <PasswordInput
              label="Contraseña actual"
              value={form.current_password}
              show={show.cur}
              onToggle={() => setShow(s => ({ ...s, cur: !s.cur }))}
              onChange={v => setForm(f => ({ ...f, current_password: v }))}
            />
            <PasswordInput
              label="Nueva contraseña"
              value={form.password}
              show={show.new}
              onToggle={() => setShow(s => ({ ...s, new: !s.new }))}
              onChange={v => setForm(f => ({ ...f, password: v }))}
            />
            {/* Strength bar */}
            {form.password && (
              <div className="space-y-1 px-0.5">
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", strength.color, strength.width)} />
                </div>
                <p className="text-[10px] text-muted-foreground">{strength.label}</p>
              </div>
            )}
            <PasswordInput
              label="Confirmar nueva contraseña"
              value={form.password_confirmation}
              show={show.conf}
              onToggle={() => setShow(s => ({ ...s, conf: !s.conf }))}
              onChange={v => setForm(f => ({ ...f, password_confirmation: v }))}
              error={form.password_confirmation && form.password !== form.password_confirmation ? "Las contraseñas no coinciden" : ""}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" size="sm" onClick={() => mut.mutate()} disabled={!valid || mut.isPending}>
                {mut.isPending ? "Guardando..." : "Actualizar contraseña"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Info académica ───────────────────────────────────────── */
function InfoAcademicaCard() {
  const { data: materias = [] } = useQuery({
    queryKey: ["materias-perfil"],
    queryFn: materiasService.listMine,
  });

  const activas = (materias as any[]).filter((m: any) => m.active !== false);

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <SectionHeader icon={GraduationCap} title="Información académica"
        badge={<span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">Solo lectura</span>} />

      {activas.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">No tenés materias inscriptas en este período.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatChip label="Materias activas" value={activas.length} />
            <StatChip label="Período" value={(activas[0] as any)?.periodo?.name ?? "—"} />
            <StatChip label="Carrera" value={(activas[0] as any)?.carrera ?? "—"} small />
          </div>

          {/* Materia list */}
          <div className="space-y-2">
            {activas.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  {m.docente && <p className="text-xs text-muted-foreground truncate">{m.docente.name}</p>}
                </div>
                {m.code && <span className="text-xs text-muted-foreground font-mono shrink-0">{m.code}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Estado de cuenta ─────────────────────────────────────── */
function EstadoCuentaCard() {
  const navigate = useNavigate();

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <SectionHeader icon={CreditCard} title="Estado de cuenta" />

      <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="text-sm font-medium">Información de pagos y aranceles</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Para consultas sobre tu estado de cuenta, pagos o inscripción, contactá a administración.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/mensajes")} className="shrink-0">
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />Contactar
        </Button>
      </div>
    </section>
  );
}

/* ─── Componentes internos reutilizables ───────────────────── */
function SectionHeader({ icon: Icon, title, action, badge }: { icon: any; title: string; action?: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="font-semibold text-sm text-foreground">{title}</h2>
        {badge}
      </div>
      {action}
    </div>
  );
}

function DataRow({ icon: Icon, label, value, muted }: { icon: any; label: string; value?: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium truncate mt-0.5", muted && "text-muted-foreground")}>{value ?? "—"}</p>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, show, onToggle, onChange, error }: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn("pr-9", error && "border-destructive focus-visible:ring-destructive")}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function StatChip({ label, value, small }: { label: string; value: any; small?: boolean }) {
  return (
    <div className="bg-secondary rounded-xl p-3 text-center">
      <p className={cn("font-semibold", small ? "text-sm" : "text-xl")}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
