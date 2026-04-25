import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  variant?: "dark" | "light";
}

export const Logo = ({ className, size = "md", showText = true, variant = "dark" }: LogoProps) => {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-base", sub: "text-[10px]" },
    md: { icon: "h-9 w-9", text: "text-lg", sub: "text-xs" },
    lg: { icon: "h-12 w-12", text: "text-2xl", sub: "text-sm" },
  };
  const s = sizes[size];
  const colors = variant === "light"
    ? { icon: "bg-background/10 text-background border-background/20", title: "text-background", sub: "text-background/70" }
    : { icon: "bg-gradient-hero text-primary-foreground border-primary/10", title: "text-foreground", sub: "text-muted-foreground" };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex items-center justify-center rounded-xl border shadow-soft", s.icon, colors.icon)}>
        <BookOpen className="h-1/2 w-1/2" strokeWidth={2} />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-display font-semibold tracking-tight", s.text, colors.title)}>Instituto Bíblico</span>
          <span className={cn("uppercase tracking-[0.18em] font-medium", s.sub, colors.sub)}>Aula Virtual</span>
        </div>
      )}
    </div>
  );
};
