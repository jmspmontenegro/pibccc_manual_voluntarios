"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Link as LinkIcon, Search, Upload, Users, Warehouse } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { NativeSelect } from "@/components/crud/native-select";
import { DateField } from "@/components/crud/date-field";
import { RequiredLabel } from "@/components/crud/required-label";
import { TimeField } from "@/components/crud/time-field";
import { createEventWithScale, updateEventWithScale } from "@/app/(app)/eventos/actions";
import { cn } from "@/lib/utils";

type EventType = { id: string; name: string };
type Team = { id: string; name: string; color: string };
type Person = { id: string; full_name: string | null; email: string; team_id: string | null; preferred_room_id: string | null };
type Room = { id: string; name: string };
type Template = { id: string; name: string };

export type ExistingEvent = {
  id: string;
  event_type_id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  scriptUrl: string | null;
  roomIds: string[];
  teamIds: string[];
  participants: { user_id: string; room_id: string | null }[];
};

const steps = ["Evento", "Salas", "Escala", "Finalizar"];

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return value;
}

export function NewEventForm({ eventTypes, teams, membersByTeam, rooms, volunteers, templates, canCreateScale, existingEvent }: {
  eventTypes: EventType[]; teams: Team[]; membersByTeam: Record<string, Person[]>; rooms: Room[];
  volunteers: Person[]; templates: Template[]; canCreateScale: boolean; existingEvent?: ExistingEvent;
}) {
  const isEdit = !!existingEvent;
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [eventData, setEventData] = useState<Record<string, string>>(
    existingEvent
      ? {
          event_type_id: existingEvent.event_type_id,
          title: existingEvent.title,
          description: existingEvent.description ?? "",
          start_time: existingEvent.start_time ?? "",
          end_time: existingEvent.end_time ?? "",
          location: existingEvent.location ?? "",
        }
      : {}
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(existingEvent?.date ?? "");
  const [recurs, setRecurs] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const [showEndTime, setShowEndTime] = useState(!!existingEvent?.end_time);
  const [roomIds, setRoomIds] = useState<Set<string>>(new Set(existingEvent?.roomIds ?? []));
  const [teamIds, setTeamIds] = useState<Set<string>>(new Set(existingEvent?.teamIds ?? []));
  const [personIds, setPersonIds] = useState<Set<string>>(
    new Set((existingEvent?.participants ?? []).map((p) => p.user_id))
  );
  const [roomByPerson, setRoomByPerson] = useState<Record<string, string>>(
    Object.fromEntries(
      (existingEvent?.participants ?? []).filter((p) => p.room_id).map((p) => [p.user_id, p.room_id!])
    )
  );
  const [query, setQuery] = useState("");
  const [checklistMode, setChecklistMode] = useState<"none" | "template" | "blank">("none");
  const [templateId, setTemplateId] = useState("");

  const cultoType = useMemo(() => eventTypes.find((type) => type.name === "Culto"), [eventTypes]);
  const selectedRooms = useMemo(() => rooms.filter((room) => roomIds.has(room.id)), [roomIds, rooms]);
  const selectedPeople = useMemo(() => volunteers.filter((person) => personIds.has(person.id)), [personIds, volunteers]);
  const selectedTeams = useMemo(() => teams.filter((team) => teamIds.has(team.id)), [teamIds, teams]);
  const dates = useMemo(() => recurs && date ? Array.from({ length: Math.max(1, Math.min(52, weeks)) }, (_, i) => addDays(date, i * 7)) : [], [date, recurs, weeks]);
  const visiblePeople = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? volunteers.filter((p) => `${p.full_name ?? ""} ${p.email}`.toLowerCase().includes(term)) : volunteers;
  }, [query, volunteers]);

  function toggleRoom(roomId: string) {
    setRoomIds((current) => {
      const next = new Set(current);
      if (next.has(roomId)) {
        next.delete(roomId);
        setRoomByPerson((assignments) => Object.fromEntries(Object.entries(assignments).filter(([, value]) => value !== roomId)));
      } else next.add(roomId);
      return next;
    });
  }

  function toggleTeam(teamId: string) {
    const adding = !teamIds.has(teamId);
    setTeamIds((current) => { const next = new Set(current); if (adding) next.add(teamId); else next.delete(teamId); return next; });
    if (adding) {
      const members = membersByTeam[teamId] ?? [];
      setPersonIds((current) => new Set([...current, ...members.map((member) => member.id)]));
      setRoomByPerson((current) => {
        const next = { ...current };
        for (const member of members) if (!next[member.id] && member.preferred_room_id && roomIds.has(member.preferred_room_id)) next[member.id] = member.preferred_room_id;
        return next;
      });
    }
  }

  function togglePerson(person: Person) {
    const adding = !personIds.has(person.id);
    setPersonIds((current) => { const next = new Set(current); if (adding) next.add(person.id); else next.delete(person.id); return next; });
    if (adding && person.preferred_room_id && roomIds.has(person.preferred_room_id)) setRoomByPerson((current) => ({ ...current, [person.id]: person.preferred_room_id! }));
  }

  function goForward() {
    setError(null);
    if (step === 0) {
      const form = document.getElementById("new-event-form") as HTMLFormElement;
      if (!form.reportValidity()) return;
      setEventData(Object.fromEntries([...new FormData(form).entries()].filter(([, value]) => typeof value === "string")) as Record<string, string>);
    }
    if (step === 1 && canCreateScale && roomIds.size === 0) return setError("Selecione ao menos uma sala que estará em operação.");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function submit(formData: FormData) {
    setError(null);
    for (const [key, value] of Object.entries(eventData)) formData.set(key, value);
    formData.set("room_ids", JSON.stringify([...roomIds]));
    formData.set("team_ids", JSON.stringify([...teamIds]));
    formData.set("participants", JSON.stringify(selectedPeople.map((person) => ({ user_id: person.id, room_id: roomByPerson[person.id] ?? null }))));

    if (isEdit) {
      formData.set("event_id", existingEvent.id);
      startTransition(async () => {
        const result = await updateEventWithScale(formData);
        if (result.error) return setError(result.error);
        router.push(`/eventos/${existingEvent.id}`);
      });
      return;
    }

    formData.set("recurs", String(recurs));
    formData.set("checklist_mode", checklistMode);
    formData.set("template_id", templateId);
    startTransition(async () => {
      const result = await createEventWithScale(formData);
      if (result.error) return setError(result.error);
      router.push(`/eventos/${result.eventId}`);
    });
  }

  const stepIndicator = <div className="grid grid-cols-4 gap-1" aria-label="Etapas do cadastro">{steps.map((label, index) => <div key={label} className="flex flex-col gap-1 text-center"><div className={cn("mx-auto flex size-7 items-center justify-center rounded-full text-xs font-bold", index <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{index < step ? <Check className="size-4" /> : index + 1}</div><span className={cn("text-xs", index === step ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span></div>)}</div>;

  return <><LoadingOverlay show={pending} /><form id="new-event-form" action={submit} className="flex flex-col gap-4">{stepIndicator}{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    {step === 0 && <Card><CardHeader><CardTitle>Qual é o evento?</CardTitle><CardDescription>Informe quando e onde ele acontecerá.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5"><RequiredLabel>Tipo</RequiredLabel><NativeSelect name="event_type_id" required defaultValue={eventData.event_type_id ?? cultoType?.id} placeholder="Selecione..." options={eventTypes.map((type) => ({ value: type.id, label: type.name }))} onChange={(event) => { const type = eventTypes.find((item) => item.id === event.target.value); if (type?.name === "Culto" && titleRef.current && !titleRef.current.value) titleRef.current.value = "Culto Infantil"; }} /></div>
      <div className="flex flex-col gap-1.5"><RequiredLabel htmlFor="title">Título</RequiredLabel><Input id="title" name="title" ref={titleRef} required defaultValue={eventData.title ?? (cultoType ? "Culto Infantil" : undefined)} /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="description">Descrição</Label><Input id="description" name="description" defaultValue={eventData.description} placeholder="Ex.: culto da manhã" /></div>
      <div className="flex flex-col gap-1.5"><RequiredLabel htmlFor="date">Data</RequiredLabel><DateField id="date" name="date" required value={date} onChangeIso={setDate} /></div>
      <div className="flex flex-col gap-1.5"><Label>Hora de início</Label><TimeField name="start_time" defaultValue={eventData.start_time} /></div>
      {showEndTime ? <div className="flex flex-col gap-1.5"><Label>Hora de término</Label><TimeField name="end_time" defaultValue={eventData.end_time} /></div> : <Button type="button" variant="link" size="sm" className="w-fit px-0" onClick={() => setShowEndTime(true)}>Adicionar hora de término</Button>}
      <div className="flex flex-col gap-1.5"><Label htmlFor="location">Local</Label><Input id="location" name="location" defaultValue={eventData.location} placeholder="Ex.: templo" /></div>
      {!isEdit && <div className="rounded-xl border p-3"><div className="flex items-center gap-2"><Checkbox id="recurs" checked={recurs} onCheckedChange={(checked) => setRecurs(checked === true)} /><Label htmlFor="recurs">Repete semanalmente</Label></div>{recurs && <div className="mt-3 flex flex-col gap-2"><Label htmlFor="weeks">Quantidade de semanas, incluindo esta</Label><Input id="weeks" name="weeks" type="number" min={1} max={52} value={weeks} onChange={(event) => setWeeks(Math.max(1, Number(event.target.value) || 1))} /><div className="flex flex-wrap gap-1">{dates.map((item) => <Badge key={item.toISOString()} variant="outline">{item.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</Badge>)}</div></div>}</div>}
    </CardContent></Card>}
    {step === 1 && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Warehouse className="size-4" />Quais salas funcionarão?</CardTitle><CardDescription>São os espaços que a supervisão precisa preparar neste evento.</CardDescription></CardHeader><CardContent className="grid gap-2">{rooms.map((room) => <label key={room.id} className={cn("flex min-h-14 items-center gap-3 rounded-xl border p-3", roomIds.has(room.id) && "border-primary bg-primary/5")}><Checkbox checked={roomIds.has(room.id)} onCheckedChange={() => toggleRoom(room.id)} /><span className="font-medium">{room.name}</span></label>)}{rooms.length === 0 && <p className="text-sm text-muted-foreground">Cadastre as salas antes de montar a escala.</p>}</CardContent></Card>}
    {step === 2 && <div className="flex flex-col gap-4"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-4" />Equipes responsáveis</CardTitle><CardDescription>Ao incluir uma equipe, seus membros são adicionados à escala. Você pode ajustar pessoa por pessoa.</CardDescription></CardHeader><CardContent className="grid gap-2">{teams.map((team) => <label key={team.id} className={cn("flex items-center gap-3 rounded-xl border p-3", teamIds.has(team.id) && "border-primary bg-primary/5")}><Checkbox checked={teamIds.has(team.id)} onCheckedChange={() => toggleTeam(team.id)} /><span className="flex-1 font-medium">{team.name}</span><Badge variant="outline">{(membersByTeam[team.id] ?? []).length}</Badge></label>)}</CardContent></Card><Card><CardHeader><CardTitle>Distribuição por sala</CardTitle><CardDescription>A sala preferencial é preenchida automaticamente quando ela está em operação.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><div className="relative"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Adicionar ou encontrar voluntário" /></div><div className="max-h-52 overflow-y-auto rounded-xl border">{visiblePeople.map((person) => <label key={person.id} className="flex items-center gap-3 border-b p-3 last:border-0"><Checkbox checked={personIds.has(person.id)} onCheckedChange={() => togglePerson(person)} /><span className="min-w-0 flex-1 truncate text-sm">{person.full_name || person.email}</span>{person.preferred_room_id && <span className="text-xs text-muted-foreground">preferência</span>}</label>)}</div>{selectedPeople.length > 0 && <div className="flex flex-col gap-2">{selectedPeople.map((person) => <div key={person.id} className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-sm">{person.full_name || person.email}</span><NativeSelect className="w-40 shrink-0" value={roomByPerson[person.id] ?? ""} onChange={(event) => setRoomByPerson((current) => ({ ...current, [person.id]: event.target.value }))} placeholder="Sem sala" options={selectedRooms.map((room) => ({ value: room.id, label: room.name }))} /></div>)}</div>}</CardContent></Card></div>}
    {step === 3 && <div className="flex flex-col gap-4">{isEdit ? <Alert><AlertDescription>A checklist da escala não é editada aqui — gerencie pela tela do evento.</AlertDescription></Alert> : <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="size-4" />Checklist da supervisão</CardTitle><CardDescription>Ela será replicada para cada ocorrência semanal.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2"><div className="flex gap-2"><Button type="button" size="sm" variant={checklistMode === "none" ? "default" : "outline"} onClick={() => setChecklistMode("none")}>Sem checklist</Button><Button type="button" size="sm" variant={checklistMode === "template" ? "default" : "outline"} onClick={() => setChecklistMode("template")}>Usar modelo</Button><Button type="button" size="sm" variant={checklistMode === "blank" ? "default" : "outline"} onClick={() => setChecklistMode("blank")}>Em branco</Button></div>{checklistMode === "template" && <NativeSelect value={templateId} onChange={(event) => setTemplateId(event.target.value)} placeholder="Selecione o modelo..." options={templates.map((template) => ({ value: template.id, label: template.name }))} />}</CardContent></Card>}<Card><CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="size-4" />Roteiro</CardTitle></CardHeader><CardContent className="flex flex-col gap-3"><Input name="script_url" type="url" placeholder="Link do roteiro (opcional)" defaultValue={existingEvent?.scriptUrl ?? undefined} /><div className="flex items-center gap-2"><Upload className="size-4 text-muted-foreground" /><Input name="file" type="file" /></div></CardContent></Card><Card><CardHeader><CardTitle>{isEdit ? "Revise antes de salvar" : "Revise antes de criar"}</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 text-sm">{!isEdit && <p><strong>{recurs ? `${weeks} eventos semanais` : "1 evento"}</strong>{date && ` a partir de ${new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")}`}</p>}<p>{selectedRooms.length} sala(s): {selectedRooms.map((room) => room.name).join(", ") || "nenhuma"}</p><p>{selectedTeams.length} equipe(s) responsável(is): {selectedTeams.map((team) => team.name).join(", ") || "nenhuma"}</p><p>{selectedPeople.length} voluntário(s) na escala.</p></CardContent></Card></div>}
    <div className="sticky bottom-3 flex gap-2 rounded-xl border bg-background/95 p-2 backdrop-blur"><Button type="button" variant="outline" className="flex-1" disabled={step === 0} onClick={() => { setError(null); setStep((current) => current - 1); }}><ArrowLeft />Voltar</Button>{step < steps.length - 1 ? <Button type="button" className="flex-1" onClick={goForward}>Avançar<ArrowRight /></Button> : <Button type="submit" className="flex-1" disabled={pending}>{pending ? (isEdit ? "Salvando..." : "Criando...") : (isEdit ? "Salvar alterações" : "Criar evento")}</Button>}</div>
  </form></>;
}
