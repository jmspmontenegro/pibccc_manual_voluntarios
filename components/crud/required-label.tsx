import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";

export function RequiredLabel({ children, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label {...props}>
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </Label>
  );
}
