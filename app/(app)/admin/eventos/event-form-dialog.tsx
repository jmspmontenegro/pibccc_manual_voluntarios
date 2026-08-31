"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEvent, updateEvent } from "@/app/(app)/eventos/actions";

type EventType = { id: string; name: string };

type Event = {
  id: string;
  event_type_id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
};

export function EventFormDialog({
  event,
  eventTypes,
}: {
  event?: Event;
  eventTypes: EventType[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recurs, setRecurs] = useState(false);
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleTypeChange(typeId: string) {
    const type = eventTypes.find((t) => t.id === typeId);
    if (type?.name === "Culto" && titleRef.current && !titleRef.current.value) {
      titleRef.current.value = "Culto Infantil";
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("recurs", String(recurs));
    startTransition(async () => {
      const action = event ? updateEvent : createEvent;
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setRecurs(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          event ? (
            <Button type="button" variant="ghost" size="icon-sm">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button type="button">
              <Plus className="size-4" />
              Novo evento
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Novo evento"}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          {event && <input type="hidden" name="id" value={event.id} />}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Select
              name="event_type_id"
              defaultValue={event?.event_type_id}
              onValueChange={(v) => v && handleTypeChange(v)}
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
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" ref={titleRef} required defaultValue={event?.title} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" defaultValue={event?.description ?? ""} />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" name="date" type="date" required defaultValue={event?.date} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="start_time">Hora início (opcional)</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={event?.start_time ?? ""}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="end_time">Hora fim (opcional)</Label>
              <Input id="end_time" name="end_time" type="time" defaultValue={event?.end_time ?? ""} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Local</Label>
            <Input id="location" name="location" defaultValue={event?.location ?? ""} />
          </div>

          {!event && (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recurs"
                  checked={recurs}
                  onCheckedChange={(c) => setRecurs(c === true)}
                />
                <Label htmlFor="recurs">Repete semanalmente</Label>
              </div>
              {recurs && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weeks">Quantas semanas (incluindo esta)</Label>
                  <Input id="weeks" name="weeks" type="number" min={1} max={52} defaultValue={4} />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
