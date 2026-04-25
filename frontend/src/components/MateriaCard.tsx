import { Link } from "react-router-dom";
import { Users, BookOpen, ArrowUpRight } from "lucide-react";
import type { Materia } from "@/types";
import { cn } from "@/lib/utils";

interface MateriaCardProps {
  materia: Materia;
  variant?: "estudiante" | "docente" | "admin";
}

export const MateriaCard = ({ materia, variant = "estudiante" }: MateriaCardProps) => {
  return (
    <Link
      to={`/materias/${materia.id}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-float hover:-translate-y-1 transition-bounce"
    >
      {/* Banner */}
      <div className={cn("h-24 bg-gradient-to-br relative overflow-hidden", materia.color ?? "from-primary to-primary-glow")}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-3 left-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80">
          {materia.code}
        </div>
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/25 transition-smooth">
          <ArrowUpRight className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground line-clamp-2">
          {materia.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{materia.carrera}</p>

        {variant !== "admin" && materia.docente && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="truncate">{materia.docente.name}</span>
          </div>
        )}

        {variant === "admin" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{materia.totalEstudiantes} estudiantes</span>
          </div>
        )}

        {variant === "estudiante" && typeof materia.progreso === "number" && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progreso del curso</span>
              <span className="font-semibold text-foreground">{materia.progreso}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-warm transition-all"
                style={{ width: `${materia.progreso}%` }}
              />
            </div>
          </div>
        )}

        {variant === "docente" && (
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{materia.totalEstudiantes} estudiantes</span>
            {materia.proximaEntrega && (
              <span className="text-accent font-medium">Entrega próxima</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};
