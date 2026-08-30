import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import "@/app/auth.css";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  leader: "Líder",
  volunteer: "Voluntário",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", user.id)
    .single();

  return (
    <main className="auth-main">
      <h1>Olá, {profile?.full_name || user.email}</h1>
      <p>
        Perfil: <strong>{ROLE_LABEL[profile?.role ?? "volunteer"]}</strong>
      </p>
      {profile?.role === "admin" && (
        <p style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="/admin/usuarios">Gerenciar usuários</a>
          <a href="/admin/configuracoes">Configurações</a>
        </p>
      )}
      <form className="auth-form" action={logout}>
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
