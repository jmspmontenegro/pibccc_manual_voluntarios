import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PermissionMatrix } from "./permission-matrix";

export default async function PermissoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  // Hard-gated pra admin real (não pela matriz dinâmica) — a tela que
  // configura permissões não deve depender das próprias permissões que
  // ela controla. Ver AGENTS.md → RBAC dinâmico.
  if (currentProfile?.role !== "admin") redirect("/");

  const { data: domains } = await supabase.from("permission_domains").select("key, label");
  const { data: actions } = await supabase
    .from("permission_actions")
    .select("domain_key, action_key, label");
  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("role, domain_key, action_key");

  const granted = new Set(
    (rolePermissions ?? []).map((rp) => `${rp.role}:${rp.domain_key}:${rp.action_key}`)
  );

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>
      <div>
        <h1 className="font-serif text-2xl">Permissões</h1>
        <p className="text-sm text-muted-foreground">
          Defina o que cada perfil pode fazer em cada área do sistema.
        </p>
      </div>

      <PermissionMatrix domains={domains ?? []} actions={actions ?? []} granted={granted} />
    </main>
  );
}
