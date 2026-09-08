"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Seção retrátil, fechada por padrão — reduz a carga visual inicial do
 * formulário (só "Dados do evento" precisa estar aberto de cara). Não usa
 * o CardHeader normal porque o gatilho precisa ser um <button> clicável.
 */
export function CollapsibleCard({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-(--card-spacing) text-left"
      >
        <span className="flex items-center gap-2 text-base leading-snug font-medium">
          {icon}
          {title}
        </span>
        <span className="flex items-center gap-2">
          {badge}
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && <CardContent className="flex flex-col gap-4 pt-4">{children}</CardContent>}
    </Card>
  );
}
