import { createClient } from "@/lib/supabase/server";

const ROLE_LABEL = {
  admin: "Administrador",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "volunteer";

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto flex max-w-md flex-col gap-3 rounded-2xl bg-primary p-6 shadow-lg">
        <p className="font-serif text-xl text-white">Olá, {profile?.full_name || user.email}</p>
        <span className="w-fit rounded-full bg-white/25 px-3.5 py-1 text-xs font-bold text-white">
          {ROLE_LABEL[role]}
        </span>
      </div>
    </main>
  );
}
