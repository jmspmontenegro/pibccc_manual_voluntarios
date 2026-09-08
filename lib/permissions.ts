import type { SupabaseClient } from "@supabase/supabase-js";
import { getEffectiveRole } from "@/lib/view-as";

export type Permission = `${string}:${string}`;

/**
 * RLS já barra no banco (ver AGENTS.md — RLS é a camada autoritativa). Isto é
 * só pra UX: decidir o que renderizar na tela sem esperar o banco recusar.
 *
 * `role` é sempre o papel REAL de quem chama (vindo de `profiles.role`) —
 * `getEffectiveRole` resolve pro papel simulado só quando esse papel real é
 * admin e "ver como" está ativo (ver `lib/view-as.ts`). Como todo chamador já
 * passa o papel real aqui, isso cobre a simulação em qualquer tela/action que
 * use `can()` sem precisar tocar em cada um.
 */
export async function getRolePermissions(
  supabase: SupabaseClient,
  role: string
): Promise<Set<Permission>> {
  const effectiveRole = await getEffectiveRole(role);
  const { data } = await supabase
    .from("role_permissions")
    .select("domain_key, action_key")
    .eq("role", effectiveRole);

  return new Set((data ?? []).map((row) => `${row.domain_key}:${row.action_key}` as Permission));
}

export function can(perms: Set<Permission>, domain: string, action: string): boolean {
  return perms.has(`${domain}:${action}`);
}
