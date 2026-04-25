import { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export const PlaceholderPage = ({ eyebrow, title, description, children }: PlaceholderPageProps) => (
  <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <PageHeader eyebrow={eyebrow} title={title} description={description} />
    {children ?? (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold mb-2">En construcción</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Esta sección estará disponible en una próxima iteración. La estructura visual y de datos ya está lista para conectarse al backend Laravel.
        </p>
      </div>
    )}
  </div>
);
