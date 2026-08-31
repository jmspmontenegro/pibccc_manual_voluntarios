import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { TeamBadge } from "@/components/team-badge";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { EntryFormDialog } from "./entry-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TWELVE_MONTHS_AGO = new Date();
TWELVE_MONTHS_AGO.setMonth(TWELVE_MONTHS_AGO.getMonth() - 12);
const cutoff = TWELVE_MONTHS_AGO.toISOString().slice(0, 10);

export default async function SemeandoTempoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = "date_desc" } = await searchParams;
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
  const canViewAll = can(perms, "semeando_tempo", "view");
  const canCreate = can(perms, "semeando_tempo", "create");
  const canEdit = can(perms, "semeando_tempo", "edit") || can(perms, "semeando_tempo", "delete");

  let entriesQuery = supabase
    .from("semeando_tempo_entries")
    .select(
      "id, user_id, entered_at, note, profile:profiles!semeando_tempo_entries_user_id_fkey(full_name, email, team:teams!profiles_team_id_fkey(id, name, color))"
    )
    .order("entered_at", { ascending: false });

  if (!canViewAll) entriesQuery = entriesQuery.eq("user_id", user!.id);

  const { data: entries } = await entriesQuery;

  // Contagem por pessoa nos últimos 12 meses, exibida em cada linha dela.
  const countByPerson = new Map<string, number>();
  for (const e of entries ?? []) {
    if (e.entered_at >= cutoff) {
      countByPerson.set(e.user_id, (countByPerson.get(e.user_id) ?? 0) + 1);
    }
  }

  type Row = {
    id: string;
    userId: string;
    name: string;
    email: string;
    team: { name: string; color: string } | null;
    entered_at: string;
    note: string | null;
    count12m: number;
  };

  let rows: Row[] = (entries ?? []).map((e) => {
    const profile = (e as any).profile;
    return {
      id: e.id,
      userId: e.user_id,
      name: profile?.full_name || profile?.email || "(sem nome)",
      email: profile?.email ?? "",
      team: profile?.team ? { name: profile.team.name, color: profile.team.color } : null,
      entered_at: e.entered_at,
      note: e.note,
      count12m: countByPerson.get(e.user_id) ?? 0,
    };
  });

  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  rows.sort((a, b) =>
    sort === "name" ? a.name.localeCompare(b.name) : b.entered_at.localeCompare(a.entered_at)
  );

  const { data: volunteersData } = canCreate
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("status", "approved")
        .order("full_name")
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  if (!canViewAll) {
    const own = rows[0];
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
        <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="size-4" />
          Voltar
        </a>
        <h1 className="font-serif text-2xl">Semeando Tempo</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suas entradas nos últimos 12 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{own?.count12m ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              Vez(es) que você entrou no Semeando Tempo pra cobrir a escala de alguém.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Semeando Tempo</h1>
        {canCreate && <EntryFormDialog volunteers={volunteersData ?? []} />}
      </div>

      <ListToolbar
        searchPlaceholder="Buscar pessoa..."
        sortOptions={[
          { value: "date_desc", label: "Mais recentes" },
          { value: "name", label: "Nome (A-Z)" },
        ]}
        data={rows.map((r) => ({
          Nome: r.name,
          Equipe: r.team?.name ?? "",
          "Data da falta": r.entered_at,
          "Motivo da falta": r.note ?? "",
          "Entradas (12 meses)": r.count12m,
        }))}
        filename="semeando-tempo"
      />

      <div className="print-area flex flex-col gap-3">
        {rows.map((r) => {
          const initial = r.name.charAt(0).toUpperCase();
          return (
            <div
              key={r.id}
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
                    <p className="font-semibold leading-tight">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.entered_at + "T00:00:00").toLocaleDateString("pt-BR")}
                      {r.note ? ` — ${r.note}` : ""}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <EntryFormDialog
                    entry={{
                      id: r.id,
                      userId: r.userId,
                      name: r.name,
                      email: r.email,
                      entered_at: r.entered_at,
                      note: r.note,
                    }}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {r.team && <TeamBadge name={r.team.name} color={r.team.color} />}
                <Badge variant="secondary">
                  {r.count12m} {r.count12m === 1 ? "entrada" : "entradas"} (12 meses)
                </Badge>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ninguém no Semeando Tempo ainda.
          </p>
        )}
      </div>
    </main>
  );
}
