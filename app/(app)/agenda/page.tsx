import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function monthKey(year: number, month: number) {
  return `${year}-${pad(month)}`;
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const { month: monthParam, day: dayParam } = await searchParams;

  const now = new Date();
  const [year, month] = monthParam
    ? monthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const monthDate = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthStart = dateKey(year, month, 1);
  const monthEnd = dateKey(year, month, daysInMonth);
  const todayStr = now.toISOString().slice(0, 10);

  const selectedDay =
    dayParam ?? (todayStr >= monthStart && todayStr <= monthEnd ? todayStr : monthStart);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const perms = await getRolePermissions(supabase, profile!.role);

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, start_time, location, event_type:event_types(name)")
    .gte("date", monthStart)
    .lte("date", monthEnd)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  const rows = (events ?? []).map((e) => ({
    ...e,
    typeName: (e as any).event_type?.name ?? "",
  }));

  const eventsByDay = new Map<string, typeof rows>();
  for (const e of rows) {
    if (!eventsByDay.has(e.date)) eventsByDay.set(e.date, []);
    eventsByDay.get(e.date)!.push(e);
  }

  const dayEvents = eventsByDay.get(selectedDay) ?? [];

  const firstWeekday = monthDate.getDay();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(dateKey(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonthDate = new Date(year, month - 2, 1);
  const nextMonthDate = new Date(year, month, 1);
  const prevMonthKey = monthKey(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1);
  const nextMonthKey = monthKey(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1);

  const monthLabel = monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const monthLabelCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const selectedDayLabel = new Date(selectedDay + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">{monthLabelCapitalized}</h1>
          <p className="text-sm text-muted-foreground">Calendário do Ministério</p>
        </div>
        {can(perms, "eventos", "create") && (
          <a href="/admin/eventos/novo">
            <Button size="sm">
              <Plus className="size-4" />
              Evento
            </Button>
          </a>
        )}
      </div>

      <div className="flex items-center justify-between">
        <a
          href={`/agenda?month=${prevMonthKey}`}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </a>
        <div className="grid flex-1 grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
          ))}
          {cells.map((key, i) => {
            if (!key) return <span key={`empty-${i}`} />;
            const day = Number(key.slice(-2));
            const isSelected = key === selectedDay;
            const isToday = key === todayStr;
            const hasEvents = eventsByDay.has(key);
            return (
              <a
                key={key}
                href={`/agenda?month=${monthKey(year, month)}&day=${key}`}
                className="flex flex-col items-center gap-0.5 py-0.5"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "text-primary ring-1 ring-primary/40"
                        : "text-foreground"
                  )}
                >
                  {day}
                </span>
                <span
                  className={cn(
                    "size-1 rounded-full",
                    hasEvents ? "bg-primary" : "bg-transparent"
                  )}
                />
              </a>
            );
          })}
        </div>
        <a
          href={`/agenda?month=${nextMonthKey}`}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold text-muted-foreground">
          {dayEvents.length} {dayEvents.length === 1 ? "evento" : "eventos"} · {selectedDayLabel}
        </p>
        {dayEvents.map((e) => (
          <a
            key={e.id}
            href={`/eventos/${e.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold leading-tight">{e.title}</p>
              <p className="text-sm text-muted-foreground">
                {e.typeName}
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
        {dayEvents.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum evento neste dia.
          </p>
        )}
      </div>
    </main>
  );
}
