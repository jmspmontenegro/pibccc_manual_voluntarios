import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveRole } from "@/lib/view-as";

export default async function ManualLiderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = await getEffectiveRole(profile?.role ?? "volunteer");
  if (role === "volunteer") {
    redirect("/mais");
  }

  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 p-4 text-center sm:p-6">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <GraduationCap className="size-8" />
      </span>
      <div>
        <h1 className="font-serif text-2xl">Manual do Líder</h1>
        <p className="text-sm text-muted-foreground">
          Conteúdo em preparação pra liderança (Supervisor, Coordenação e Administração).
        </p>
      </div>
    </main>
  );
}
