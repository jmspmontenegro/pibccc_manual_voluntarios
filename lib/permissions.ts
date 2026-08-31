import type { SupabaseClient } from "@supabase/supabase-js";

export type Permission = `${string}:${string}`;

/**
 * RLS já barra no banco (ver AGENTS.md — RLS é a camada autoritativa). Isto é
 * só pra UX: decidir o que renderizar na tela sem esperar o banco recusar.
 */
export async function getRolePermissions(
  supabase: SupabaseClient,
  role: string
): Promise<Set<Permission>> {
  const { data } = await supabase
    .from("role_permissions")
    .select("domain_key, action_key")
    .eq("role", role);

  return new Set((data ?? []).map((row) => `${row.domain_key}:${row.action_key}` as Permission));
}

export function can(perms: Set<Permission>, domain: string, action: string): boolean {
  return perms.has(`${domain}:${action}`);
}
