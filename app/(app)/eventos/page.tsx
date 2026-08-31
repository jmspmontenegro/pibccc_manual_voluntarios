import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function EventosPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, start_time, location, event_type:event_types(name)")
    .gte("date", today)
    .order("date", { ascending: true });

  const rows = (events ?? []).map((e) => ({
    ...e,
    typeName: (e as any).event_type?.name ?? "",
    dateLabel: new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Cultos e Eventos</h1>
        <p className="text-sm text-muted-foreground">{rows.length} próximos</p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((e) => (
          <a
            key={e.id}
            href={`/eventos/${e.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold leading-tight">{e.title}</p>
              <p className="text-xs text-muted-foreground">
                {e.typeName} · {e.dateLabel}
                {e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ""}
              </p>
              {e.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {e.location}
                </p>
              )}
            </div>
          </a>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum evento programado.
          </p>
        )}
      </div>
    </main>
  );
}
