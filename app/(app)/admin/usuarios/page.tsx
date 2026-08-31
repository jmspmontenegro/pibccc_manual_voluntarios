import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { TeamBadge } from "@/components/team-badge";
import { Badge } from "@/components/ui/badge";
import { UserCreateDialog } from "./user-create-dialog";
import { UserEditDialog } from "./user-edit-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordenação",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = "created_at" } = await searchParams;
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
  if (!can(perms, "usuarios", "view")) redirect("/");

  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, address, role, status, created_at, team_id, team:teams!profiles_team_id_fkey(id, name, color)"
    );

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  query = query.order(sort, { ascending: sort === "full_name" });

  const { data: profiles } = await query;
  const { data: teams } = await supabase.from("teams").select("id, name").order("name");

  const canCreate = can(perms, "usuarios", "create");
  const canEdit = can(perms, "usuarios", "edit");

  const rows = (profiles ?? []).map((p) => ({
    ...p,
    roleLabel: ROLE_LABEL[p.role] ?? p.role,
    createdAtLabel: new Date(p.created_at).toLocaleDateString("pt-BR"),
  }));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Usuários</h1>
        {canCreate && <UserCreateDialog />}
      </div>

      <ListToolbar
        searchPlaceholder="Buscar por nome ou e-mail..."
        sortOptions={[
          { value: "created_at", label: "Mais recentes" },
          { value: "full_name", label: "Nome (A-Z)" },
        ]}
        data={rows.map((r) => ({
          Nome: r.full_name || "(sem nome)",
          "E-mail": r.email,
          "Criado em": r.createdAtLabel,
          Perfil: r.roleLabel,
          Status: r.status === "active" ? "Aprovado" : "Bloqueado",
        }))}
        filename="usuarios"
      />

      <div className="print-area rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.full_name || "(sem nome)"}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.createdAtLabel}</TableCell>
                <TableCell>{p.roleLabel}</TableCell>
                <TableCell>
                  {(p as any).team ? (
                    <TeamBadge name={(p as any).team.name} color={(p as any).team.color} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "active" ? "default" : "destructive"}>
                    {p.status === "active" ? "Aprovado" : "Bloqueado"}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <UserEditDialog profile={p as any} teams={teams ?? []} />
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
