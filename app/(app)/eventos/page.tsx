"use client";

import { PartyPopper, Palette, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const EVENTS = [
  {
    icon: PartyPopper,
    title: "Festa Junina Kids",
    status: "Em breve",
    date: "Sáb, 15 Ago",
    time: "14:00 - 18:00",
    place: "Salão Principal",
    participants: "+45 participantes",
    bg: "#FFF4E0",
    accent: "#D97706",
  },
  {
    icon: Palette,
    title: "Oficina de Arte Sacra",
    status: "Aberto",
    date: "Qui, 12 Ago",
    time: "14:00 - 16:00",
    place: "Sala Kids 1",
    participants: "+18 participantes",
    bg: "#FCE7F3",
    accent: "#DB2777",
  },
  {
    icon: Trees,
    title: "Acampamento Juvenil",
    status: "Inscrições",
    date: "20-22 Set",
    time: "Fim de semana",
    place: "Chácara da Igreja",
    participants: "+60 participantes",
    bg: "#DCFCE7",
    accent: "#16A34A",
  },
];

export default function EventosPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Eventos</h1>
          <p className="text-sm text-muted-foreground">{EVENTS.length} eventos programados</p>
        </div>
        <Button disabled>+ Criar</Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="w-full">
          <TabsTrigger value="todos" className="flex-1">
            Todos
          </TabsTrigger>
          <TabsTrigger value="mes" className="flex-1">
            Este mês
          </TabsTrigger>
          <TabsTrigger value="proximos" className="flex-1">
            Próximos
          </TabsTrigger>
          <TabsTrigger value="encerrados" className="flex-1">
            Encerrados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4 flex flex-col gap-3">
          {EVENTS.map((e) => (
            <div
              key={e.title}
              className="flex flex-col gap-3 rounded-2xl p-4"
              style={{ backgroundColor: e.bg }}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white">
                  <e.icon className="size-5" style={{ color: e.accent }} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{e.title}</p>
                    <Badge style={{ backgroundColor: e.accent, color: "#fff" }}>{e.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {e.date} · {e.time}
                  </p>
                  <p className="text-sm text-muted-foreground">{e.place}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {e.participants}
                </span>
                <Button size="sm" style={{ backgroundColor: e.accent }}>
                  Detalhes
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="mes" />
        <TabsContent value="proximos" />
        <TabsContent value="encerrados" />
      </Tabs>

      <p className="text-center text-xs text-muted-foreground">
        Conteúdo ilustrativo — eventos reais ainda não implementados.
      </p>
    </main>
  );
}
