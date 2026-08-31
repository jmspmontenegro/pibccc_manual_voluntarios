import { createClient } from "@/lib/supabase/server";
import { TeamBadge } from "@/components/team-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordenação",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

export default async function PessoasPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, team:teams!profiles_team_id_fkey(name, color)")
    .eq("status", "active")
    .order("full_name");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Pessoas</h1>
        <p className="text-sm text-muted-foreground">{profiles?.length ?? 0} pessoas ativas</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {(profiles ?? []).map((p) => {
          const initial = (p.full_name || p.email).charAt(0).toUpperCase();
          const team = (p as any).team as { name: string; color: string } | null;
          return (
            <div key={p.id} className="glass flex items-center gap-3 rounded-2xl p-3.5">
              <Avatar className="size-10">
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{p.full_name || p.email}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABEL[p.role] ?? p.role}</p>
              </div>
              {team && <TeamBadge name={team.name} color={team.color} />}
            </div>
          );
        })}
        {(!profiles || profiles.length === 0) && (
          <p className="text-center text-sm text-muted-foreground">Nenhuma pessoa encontrada.</p>
        )}
      </div>
    </main>
  );
}
