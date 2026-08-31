import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { TeamBadge } from "@/components/team-badge";
import { TeamFormDialog } from "./team-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { deleteTeam } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <div className="print-area rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipe</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Membros</TableHead>
              {(canEdit || canDelete) && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <TeamBadge name={t.name} color={t.color} />
                </TableCell>
                <TableCell>{t.supervisorName}</TableCell>
                <TableCell>{t.members}</TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma equipe cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
