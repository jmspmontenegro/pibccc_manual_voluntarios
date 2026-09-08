import { cookies } from "next/headers";

export const VIEW_AS_COOKIE = "view_as_role";

export const SIMULATABLE_ROLES = ["volunteer", "leader", "coordinator"] as const;
export type SimulatableRole = (typeof SIMULATABLE_ROLES)[number];

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordenação",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

export async function getViewAsRole(): Promise<SimulatableRole | null> {
  const store = await cookies();
  const value = store.get(VIEW_AS_COOKIE)?.value;
  return (SIMULATABLE_ROLES as readonly string[]).includes(value ?? "")
    ? (value as SimulatableRole)
    : null;
}

/**
 * Papel usado pra decidir o que mostrar/permitir na tela. Só diverge do
 * papel real quando quem está logado é admin de verdade e ativou "ver
 * como" — nunca é a barreira de segurança (RLS continua checando o role
 * de verdade em auth.uid()), só simula a experiência de outro perfil pro
 * admin validar navegação/visibilidade sem precisar de uma segunda conta.
 */
export async function getEffectiveRole(realRole: string): Promise<string> {
  if (realRole !== "admin") return realRole;
  const viewAs = await getViewAsRole();
  return viewAs ?? realRole;
}
