import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/app/admin/admin-nav";
import { updateUser } from "./actions";
import "@/app/admin/admin.css";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") redirect("/dashboard");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, address, role, status, created_at")
    .order("created_at", { ascending: true });

  return (
    <main className="admin-main">
      <AdminNav />
      <h1>Usuários</h1>

      {profiles?.map((p) => (
        <div className="user-card" key={p.id}>
          <h3>{p.full_name || "(sem nome)"}</h3>
          <p className="user-email">{p.email}</p>

          <form action={updateUser} className="user-form">
            <input type="hidden" name="id" value={p.id} />

            <div className="field">
              <label>Nome completo</label>
              <input name="full_name" type="text" defaultValue={p.full_name ?? ""} />
            </div>

            <div className="field">
              <label>Telefone</label>
              <input name="phone" type="tel" required defaultValue={p.phone ?? ""} />
            </div>

            <div className="field">
              <label>Endereço</label>
              <input name="address" type="text" defaultValue={p.address ?? ""} />
            </div>

            <div className="field">
              <label>Perfil</label>
              <select name="role" defaultValue={p.role}>
                <option value="volunteer">Voluntário</option>
                <option value="leader">Líder</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue={p.status}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <button type="submit">Salvar</button>
          </form>
        </div>
      ))}
    </main>
  );
}
