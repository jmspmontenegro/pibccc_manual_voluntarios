"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Link as LinkIcon, Upload, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { TimeField } from "@/components/crud/time-field";
import { RequiredLabel } from "@/components/crud/required-label";
import { createEventWithScale } from "@/app/(app)/eventos/actions";

type EventType = { id: string; name: string };
type Team = { id: string; name: string; color: string };
type Person = { id: string; full_name: string | null; email: string };
type Room = { id: string; name: string };
type Template = { id: string; name: string };

export function NewEventForm({
  eventTypes,
  teams,
  membersByTeam,
  rooms,
  volunteers,
  templates,
  canCreateScale,
}: {
  eventTypes: EventType[];
  teams: Team[];
  membersByTeam: Record<string, Person[]>;
  rooms: Room[];
  volunteers: Person[];
  templates: Template[];
  canCreateScale: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);

  const [recurs, setRecurs] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamSelected, setTeamSelected] = useState<Set<string>>(new Set());
  const [extraQuery, setExtraQuery] = useState("");
  const [extraSelected, setExtraSelected] = useState<Set<string>>(new Set());
  const [checklistMode, setChecklistMode] = useState<"none" | "template" | "blank">("none");
  const [templateId, setTemplateId] = useState<string | null>(null);

  const teamMembers = useMemo(() => (teamId ? membersByTeam[teamId] ?? [] : []), [teamId, membersByTeam]);

  const filteredVolunteers = useMemo(() => {
    const q = extraQuery.trim().toLowerCase();
    const pool = q
      ? volunteers.filter(
          (p) => (p.full_name ?? "").toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
        )
      : volunteers;
    return pool.slice(0, 30);
  }, [extraQuery, volunteers]);

  function toggleTeamMember(id: string) {
    setTeamSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExtra(id: string) {
    setExtraSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleTypeChange(typeId: string) {
    const type = eventTypes.find((t) => t.id === typeId);
    if (type?.name === "Culto" && titleRef.current && !titleRef.current.value) {
      titleRef.current.value = "Culto Infantil";
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("recurs", String(recurs));
    if (teamId) formData.set("team_id", teamId);
    for (const id of teamSelected) formData.append("team_user_ids", id);
    for (const id of extraSelected) formData.append("extra_user_ids", id);
    formData.set("checklist_mode", checklistMode);
    if (checklistMode === "template" && templateId) formData.set("template_id", templateId);

    startTransition(async () => {
      const result = await createEventWithScale(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/eventos/${result.eventId}`);
    });
  }

  return (
    <>
      <LoadingOverlay show={pending} />
      <form action={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados do evento</CardTitle>
            <p className="text-xs text-muted-foreground">
              Campos com <span className="text-destructive">*</span> são obrigatórios.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <RequiredLabel>Tipo</RequiredLabel>
              <Select
                name="event_type_id"
                onValueChange={(v) => v && handleTypeChange(v as string)}
                items={Object.fromEntries(eventTypes.map((t) => [t.id, t.name]))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <RequiredLabel htmlFor="title">Título</RequiredLabel>
              <Input id="title" name="title" ref={titleRef} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" name="description" />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <RequiredLabel htmlFor="date">Data</RequiredLabel>
                <Input id="date" name="date" type="date" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Hora início (opcional)</Label>
              <TimeField name="start_time" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Hora fim (opcional)</Label>
              <TimeField name="end_time" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Local</Label>
              <Input id="location" name="location" />
            </div>

            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Checkbox id="recurs" checked={recurs} onCheckedChange={(c) => setRecurs(c === true)} />
                <Label htmlFor="recurs">Repete semanalmente</Label>
              </div>
              {recurs && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weeks">Quantas semanas (incluindo esta)</Label>
                  <Input id="weeks" name="weeks" type="number" min={1} max={52} defaultValue={4} />
                  <p className="text-xs text-muted-foreground">
                    A escala, equipe e checklist configuradas abaixo são replicadas em cada semana.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {canCreateScale && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Equipe e participantes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Equipe (opcional)</Label>
                  <Select
                    onValueChange={(v) => {
                      setTeamId(v as string);
                      setTeamSelected(new Set());
                    }}
                    items={Object.fromEntries(teams.map((t) => [t.id, t.name]))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sem equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {teamId && (
                  <div className="flex flex-col gap-1 rounded-lg border p-2">
                    {teamMembers.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={teamSelected.has(m.id)}
                          onCheckedChange={() => toggleTeamMember(m.id)}
                        />
                        {m.full_name || m.email}
                      </label>
                    ))}
                    {teamMembers.length === 0 && (
                      <p className="px-2 py-1.5 text-sm text-muted-foreground">
                        Essa equipe ainda não tem membros cadastrados.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label>Participantes adicionais (opcional)</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Buscar por nome..."
                      value={extraQuery}
                      onChange={(e) => setExtraQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex max-h-48 flex-col overflow-y-auto rounded-lg border p-2">
                    {filteredVolunteers.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={extraSelected.has(p.id)}
                          onCheckedChange={() => toggleExtra(p.id)}
                        />
                        {p.full_name || p.email}
                      </label>
                    ))}
                    {filteredVolunteers.length === 0 && (
                      <p className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhum voluntário encontrado.
                      </p>
                    )}
                  </div>
                  {extraSelected.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {extraSelected.size} participante(s) adicional(is) selecionado(s).
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Sala (opcional)</Label>
                  <Select name="room_id" items={Object.fromEntries(rooms.map((r) => [r.id, r.name]))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sem sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="role">Função (opcional)</Label>
                  <Input id="role" name="role" placeholder="Ex: Voluntário" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="size-4" />
                  Roteiro
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="scale_name">Nome da escala</Label>
                  <Input id="scale_name" name="scale_name" defaultValue="Escala" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="script_url">Link externo (opcional)</Label>
                  <Input
                    id="script_url"
                    name="script_url"
                    type="url"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="file" className="flex items-center gap-1.5">
                    <Upload className="size-3.5" />
                    Ou anexar arquivo (opcional)
                  </Label>
                  <Input id="file" name="file" type="file" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="size-4" />
                  Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={checklistMode === "none" ? "default" : "outline"}
                    onClick={() => setChecklistMode("none")}
                  >
                    Sem checklist
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={checklistMode === "template" ? "default" : "outline"}
                    onClick={() => setChecklistMode("template")}
                  >
                    Usar modelo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={checklistMode === "blank" ? "default" : "outline"}
                    onClick={() => setChecklistMode("blank")}
                  >
                    Criar em branco
                  </Button>
                </div>
                {checklistMode === "template" && (
                  <Select
                    onValueChange={(v) => setTemplateId(v as string)}
                    items={Object.fromEntries(templates.map((t) => [t.id, t.name]))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Button type="submit" size="lg" disabled={pending} className="sticky bottom-4">
          {pending ? "Criando..." : "Criar evento"}
        </Button>
      </form>
    </>
  );
}
