import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, SIMULATABLE_ROLES } from "@/lib/view-as";
import { setViewAsRole, clearViewAsRole } from "./view-as-actions";

/**
 * Atalho só pro admin de verdade — testar navegação/acesso como outro
 * perfil sem precisar de uma segunda conta. Ver `lib/view-as.ts` (não afeta
 * RLS, só o que é renderizado/permitido na tela).
 */
export function ViewAsSwitcher({ currentViewAs }: { currentViewAs: string | null }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Eye className="size-4" />
          Ver como outro perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {SIMULATABLE_ROLES.map((role) => (
          <form key={role} action={setViewAsRole}>
            <input type="hidden" name="role" value={role} />
            <Button
              type="submit"
              size="sm"
              variant={currentViewAs === role ? "default" : "outline"}
              disabled={currentViewAs === role}
            >
              {ROLE_LABEL[role]}
            </Button>
          </form>
        ))}
        {currentViewAs && (
          <form action={clearViewAsRole}>
            <Button type="submit" size="sm" variant="ghost">
              Voltar ao normal
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
