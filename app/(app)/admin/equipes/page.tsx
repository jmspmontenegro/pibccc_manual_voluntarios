import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { TeamFormDialog } from "./team-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { deleteTeam } from "./actions";

export default async function EquipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = "name" } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const perms = await getRolePermissions(supabase, currentProfile!.role);
  if (!can(perms, "equipes", "view")) redirect("/");

  let query = supabase
    .from("teams")
    .select("id, name, color, supervisor_id, supervisor:profiles!teams_supervisor_id_fkey(full_name, email)");

  if (q) query = query.ilike("name", `%${q}%`);
  query = query.order(sort === "name" ? "name" : "created_at", {
    ascending: sort !== "created_at_desc",
  });

  const { data: teams } = await query;

  const { data: members } = await supabase.from("profiles").select("team_id");
  const memberCount = new Map<string, number>();
  for (const m of members ?? []) {
    if (!m.team_id) continue;
    memberCount.set(m.team_id, (memberCount.get(m.team_id) ?? 0) + 1);
  }

  const { data: supervisors } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["leader", "coordinator", "admin"])
    .order("full_name");

  const canCreate = can(perms, "equipes", "create");
  const canEdit = can(perms, "equipes", "edit");
  const canDelete = can(perms, "equipes", "delete");

  const rows = (teams ?? []).map((t) => ({
    ...t,
    supervisorName: (t as any).supervisor?.full_name || (t as any).supervisor?.email || "—",
    members: memberCount.get(t.id) ?? 0,
  }));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Equipes</h1>
        {canCreate && <TeamFormDialog supervisors={supervisors ?? []} />}
      </div>

      <ListToolbar
        searchPlaceholder="Buscar equipe..."
        sortOptions={[
          { value: "name", label: "Nome (A-Z)" },
          { value: "created_at_desc", label: "Mais recentes" },
        ]}
        data={rows.map((r) => ({
          Nome: r.name,
          Supervisor: r.supervisorName,
          Membros: r.members,
        }))}
        filename="equipes"
      />

      <div className="print-area flex flex-col gap-3">
        {rows.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-11 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: t.color }}
                >
                  <Users className="size-5" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Supervisor: {t.supervisorName}</p>
                </div>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex gap-1">
                  {canEdit && (
                    <TeamFormDialog
                      team={{
                        id: t.id,
                        name: t.name,
                        supervisor_id: t.supervisor_id,
                        color: t.color,
                      }}
                      supervisors={supervisors ?? []}
                    />
                  )}
                  {canDelete && (
                    <DeleteButton
                      id={t.id}
                      action={deleteTeam}
                      confirmMessage={`Excluir a equipe "${t.name}"?`}
                    />
                  )}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="w-fit">
              {t.members} {t.members === 1 ? "membro" : "membros"}
            </Badge>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma equipe cadastrada.
          </p>
        )}
      </div>
    </main>
  );
}
