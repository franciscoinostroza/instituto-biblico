import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: ReactNode;
  accent?: "primary" | "accent" | "estudiante";
}

export const StatCard = ({ label, value, delta, icon, accent = "primary" }: StatCardProps) => {
  const accents = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    estudiante: "bg-role-estudiante/10 text-role-estudiante",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition-smooth">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-foreground tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", accents[accent])}>
          {icon}
        </div>
      </div>
    </div>
  );
};
