import { Sparkles, AlertTriangle, FileWarning, Cake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const ROLE_LABEL = {
  admin: "Administrador",
  coordinator: "Coordenação",
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
    .select("full_name, role, preferred_room:rooms(name)")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "volunteer";
  const isSupervisor = role === "leader" || role === "coordinator" || role === "admin";
  const preferredRoomName = profile?.preferred_room?.name ?? null;

  const today = new Date().toISOString().slice(0, 10);
  const { data: myAssignments } = await supabase
    .from("scale_assignments")
    .select(
      "id, scale_id, scale:scales(name, event:events(id, title, date, start_time))"
    )
    .eq("user_id", user.id);

  const nextAssignment = (myAssignments ?? [])
    .filter((a) => (a.scale)?.event?.date >= today)
    .sort((a, b) => a.scale.event.date.localeCompare(b.scale.event.date))[0];

  let declinedCount = 0;
  if (nextAssignment && isSupervisor) {
    const { count } = await supabase
      .from("scale_assignments")
      .select("id", { count: "exact", head: true })
      .eq("scale_id", nextAssignment.scale_id)
      .eq("confirmation_status", "declined");
    declinedCount = count ?? 0;
  }

  const { data: myDocs } = await supabase
    .from("volunteer_documents")
    .select("valid_until")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1);

  const documentValidUntil = myDocs?.[0]?.valid_until ?? null;
  const documentPending = !documentValidUntil || documentValidUntil < today;

  const now = new Date();
  const { data: birthdayProfiles } = await supabase
    .from("profiles")
    .select("full_name, email, birth_date")
    .not("birth_date", "is", null);

  const aniversariantes = (birthdayProfiles ?? [])
    .filter((p) => new Date(p.birth_date + "T00:00:00").getMonth() === now.getMonth())
    .sort(
      (a, b) =>
        new Date(a.birth_date + "T00:00:00").getDate() -
        new Date(b.birth_date + "T00:00:00").getDate()
    );

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--orange-dark)] to-[color:var(--orange-light)] text-white shadow">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="font-serif text-base font-bold leading-tight">Start</p>
          <p className="text-xs leading-tight text-muted-foreground">PIB Campo Comprido</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
        <Sparkles className="absolute right-4 top-4 size-8 text-white/30" />
        <p className="font-semibold">Bem-vindo de volta! 👋</p>
        <p className="mt-1 font-serif text-2xl font-bold">{profile?.full_name || user.email}</p>
        {preferredRoomName && (
          <p className="mt-1 text-sm text-white/85">Sala preferencial: {preferredRoomName}</p>
        )}
        <span className="mt-3 inline-block w-fit rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold">
          {ROLE_LABEL[role]}
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-bold">Avisos</h2>
        <div className="flex flex-col gap-2.5">
          {nextAssignment && (
            <div className="flex flex-col gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/25">
                  <AlertTriangle className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Sua próxima escala</p>
                  <p className="text-xs opacity-85">
                    {nextAssignment.scale.event.title} ·{" "}
                    {new Date(nextAssignment.scale.event.date + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "short" }
                    )}
                    {nextAssignment.scale.event.start_time
                      ? ` · ${nextAssignment.scale.event.start_time.slice(0, 5)}`
                      : ""}
                  </p>
                </div>
              </div>
              {isSupervisor && declinedCount > 0 && (
                <p className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold">
                  {declinedCount} voluntário(s) não poderão participar dessa escala — ação
                  necessária.
                </p>
              )}
              <a href={`/eventos/${nextAssignment.scale.event.id}`}>
                <Button size="sm" variant="secondary" className="w-fit">
                  Ver detalhes
                </Button>
              </a>
            </div>
          )}

          {documentPending && (
            <a
              href="/documentos"
              className="flex items-center gap-3 rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB] p-4 text-[#92400E]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/60">
                <FileWarning className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold">Documento pendente</p>
                <p className="text-xs opacity-85">
                  {documentValidUntil
                    ? "Certidão de antecedentes vencida — envie uma nova."
                    : "Certidão de antecedentes pendente — envie o quanto antes."}
                </p>
              </div>
            </a>
          )}

          {!nextAssignment && !documentPending && (
            <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Nenhum aviso no momento.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
          Aniversariantes do mês <Cake className="size-5 text-primary" />
        </h2>
        <div className="flex flex-col gap-2">
          {aniversariantes.map((p) => {
            const date = new Date(p.birth_date + "T00:00:00");
            return (
              <div
                key={p.email}
                className="flex items-center justify-between rounded-xl border p-3 text-sm"
              >
                <span className="font-medium">{p.full_name || p.email}</span>
                <span className="text-muted-foreground">
                  {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            );
          })}
          {aniversariantes.length === 0 && (
            <p className="text-sm text-muted-foreground">Ninguém faz aniversário este mês.</p>
          )}
        </div>
      </section>
    </main>
  );
}
