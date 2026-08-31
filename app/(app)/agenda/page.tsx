import { Church, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const WEEK = [
  { label: "Qui", day: 1 },
  { label: "Sex", day: 2 },
  { label: "Sáb", day: 3 },
  { label: "Dom", day: 4, active: true },
  { label: "Seg", day: 5 },
  { label: "Ter", day: 6 },
  { label: "Qua", day: 7 },
];

const EVENTS_TODAY = [
  { icon: Church, title: "Culto Infantil", time: "10:00 - 11:30", color: "#8060FF" },
  { icon: BookOpen, title: "Escola Bíblica", time: "09:00 - 09:45", color: "#2563AB" },
];

export default function AgendaPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Agosto 2026</h1>
          <p className="text-sm text-muted-foreground">Calendário do Ministério</p>
        </div>
        <Button disabled>+ Evento</Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">{d.label}</span>
            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                d.active ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              {d.day}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold text-muted-foreground">{EVENTS_TODAY.length} eventos neste dia</p>
        {EVENTS_TODAY.map((e) => (
          <div key={e.title} className="glass flex items-center gap-3 rounded-2xl p-4">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${e.color}1a`, color: e.color }}
            >
              <e.icon className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold">{e.title}</p>
              <p className="text-sm" style={{ color: e.color }}>
                {e.time}
              </p>
            </div>
            <span className="h-8 w-1 rounded-full" style={{ backgroundColor: e.color }} />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Conteúdo ilustrativo — agenda real ainda não implementada.
      </p>
    </main>
  );
}
