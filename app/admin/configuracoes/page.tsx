import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/app/admin/admin-nav";
import { updateSettings } from "./actions";
import "@/app/admin/admin.css";

const LOGOS = [
  { label: "Logo roxa (PNG)", href: "/img/LOGO START ROXA PNG.png" },
  { label: "Logo branca (PNG)", href: "/img/LOGO START BRANCA PNG.png" },
  { label: "Logo roxa (SVG)", href: "/img/LOGO START ROXA.svg" },
];

export default async function ConfiguracoesPage() {
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

  const { data: settings } = await supabase
    .from("app_settings")
    .select("primary_color")
    .single();

  return (
    <main className="admin-main">
      <AdminNav />
      <h1>Configurações</h1>

      <section>
        <h2>Cor principal</h2>
        <form action={updateSettings} className="settings-form">
          <div className="settings-field">
            <label htmlFor="primary_color">Cor da aplicação</label>
            <input
              id="primary_color"
              name="primary_color"
              type="color"
              defaultValue={settings?.primary_color ?? "#8060FF"}
            />
          </div>
          <button type="submit">Salvar cor</button>
        </form>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2>Logomarca do ministério</h2>
        <p>Logo usada atualmente no manual do voluntário.</p>
        <div className="settings-actions">
          {LOGOS.map((logo) => (
            <a key={logo.href} href={logo.href} download>
              {logo.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
