import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { TeamBadge } from "@/components/team-badge";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { AddEntryDialog } from "./add-entry-dialog";
import { HistoryDialog } from "./history-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TWELVE_MONTHS_AGO = new Date();
TWELVE_MONTHS_AGO.setMonth(TWELVE_MONTHS_AGO.getMonth() - 12);
const cutoff = TWELVE_MONTHS_AGO.toISOString().slice(0, 10);

export default async function SemeandoTempoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = "count_desc" } = await searchParams;
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

  type PersonRow = {
    userId: string;
    name: string;
    team: { name: string; color: string } | null;
    count12m: number;
    entries: { id: string; entered_at: string; note: string | null }[];
  };

  const byPerson = new Map<string, PersonRow>();
  for (const e of entries ?? []) {
    const profile = (e as any).profile;
    const existing: PersonRow = byPerson.get(e.user_id) ?? {
      userId: e.user_id,
      name: profile?.full_name || profile?.email || "(sem nome)",
      team: profile?.team ? { name: profile.team.name, color: profile.team.color } : null,
      count12m: 0,
      entries: [],
    };
    existing.entries.push({ id: e.id, entered_at: e.entered_at, note: e.note });
    if (e.entered_at >= cutoff) existing.count12m += 1;
    byPerson.set(e.user_id, existing);
  }

  let rows = Array.from(byPerson.values());
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  rows.sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.count12m - a.count12m));

  const { data: volunteers } = canCreate
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("status", "active")
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
        {canCreate && <AddEntryDialog volunteers={volunteers ?? []} />}
      </div>

      <ListToolbar
        searchPlaceholder="Buscar pessoa..."
        sortOptions={[
          { value: "count_desc", label: "Mais entradas" },
          { value: "name", label: "Nome (A-Z)" },
        ]}
        data={rows.map((r) => ({
          Nome: r.name,
          Equipe: r.team?.name ?? "",
          "Entradas (12 meses)": r.count12m,
        }))}
        filename="semeando-tempo"
      />

      <div className="print-area rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Entradas (12 meses)</TableHead>
              <TableHead className="text-right">Histórico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.userId}>
                <TableCell>{r.name}</TableCell>
                <TableCell>
                  {r.team ? (
                    <TeamBadge name={r.team.name} color={r.team.color} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{r.count12m}</TableCell>
                <TableCell className="text-right">
                  <HistoryDialog name={r.name} entries={r.entries} editable={canEdit} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Ninguém no Semeando Tempo ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
