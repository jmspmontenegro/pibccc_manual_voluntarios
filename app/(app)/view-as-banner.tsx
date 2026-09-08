import { EyeOff } from "lucide-react";
import { ROLE_LABEL } from "@/lib/view-as";
import { clearViewAsRole } from "./view-as-actions";

export function ViewAsBanner({ role }: { role: string }) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950">
      <span>Visualizando como: {ROLE_LABEL[role] ?? role}</span>
      <form action={clearViewAsRole}>
        <button type="submit" className="flex shrink-0 items-center gap-1 underline underline-offset-2">
          <EyeOff className="size-3.5" />
          Voltar ao meu acesso
        </button>
      </form>
    </div>
  );
}
