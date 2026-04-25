import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ eyebrow, title, description, actions, className }: PageHeaderProps) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8", className)}>
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold mb-2">{eyebrow}</p>}
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
};
