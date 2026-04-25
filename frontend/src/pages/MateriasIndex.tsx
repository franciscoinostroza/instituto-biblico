import { PageHeader } from "@/components/PageHeader";
import { MateriaCard } from "@/components/MateriaCard";
import { useAuthStore } from "@/store/authStore";
import { useMisMaterias } from "@/hooks/useMaterias";

export default function MateriasIndex() {
  const { user } = useAuthStore();
  const { data: materias = [], isLoading } = useMisMaterias();
  const variant = user?.role === "admin" ? "admin" : user?.role === "docente" ? "docente" : "estudiante";

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        eyebrow="Período 2026-1"
        title="Mis materias"
        description="Acceso rápido a todas tus materias del período lectivo actual."
      />
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {materias.map((m) => <MateriaCard key={m.id} materia={m} variant={variant} />)}
        </div>
      )}
    </div>
  );
}
