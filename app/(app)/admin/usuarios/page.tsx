import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { TeamBadge } from "@/components/team-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCreateDialog } from "./user-create-dialog";
import { UserEditDialog } from "./user-edit-dialog";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordenação",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  blocked: "Bloqueado",
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  blocked: "destructive",
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
      "id, full_name, email, phone, address, role, status, created_at, team_id, preferred_room_id, birth_date, team:teams!profiles_team_id_fkey(id, name, color)"
    );

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  query = query.order(sort, { ascending: sort === "full_name" });

  const { data: profiles } = await query;
  const { data: teams } = await supabase.from("teams").select("id, name").order("name");
  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");
  const { data: semeandoTempoEntries } = await supabase
    .from("semeando_tempo_entries")
    .select("id, user_id, entered_at, note")
    .order("entered_at", { ascending: false });

  const semeandoTempoByUser = new Map<string, { id: string; entered_at: string; note: string | null }[]>();
  for (const e of semeandoTempoEntries ?? []) {
    const list = semeandoTempoByUser.get(e.user_id) ?? [];
    list.push({ id: e.id, entered_at: e.entered_at, note: e.note });
    semeandoTempoByUser.set(e.user_id, list);
  }

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
          Status: STATUS_LABEL[r.status] ?? r.status,
        }))}
        filename="usuarios"
      />

      <div className="print-area flex flex-col gap-3">
        {rows.map((p) => {
          const team = (p as any).team as { name: string; color: string } | null;
          const initial = (p.full_name || p.email).charAt(0).toUpperCase();
          return (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold leading-tight">{p.full_name || "(sem nome)"}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </div>
                </div>
                {canEdit && (
                  <UserEditDialog
                    profile={p as any}
                    teams={teams ?? []}
                    rooms={rooms ?? []}
                    semeandoTempoHistory={semeandoTempoByUser.get(p.id) ?? []}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{p.roleLabel}</Badge>
                <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </Badge>
                {team && <TeamBadge name={team.name} color={team.color} />}
                <span className="ml-auto text-xs text-muted-foreground">{p.createdAtLabel}</span>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado.
          </p>
        )}
      </div>
    </main>
  );
}
