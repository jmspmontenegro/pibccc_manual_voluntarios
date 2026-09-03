"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { TimeField } from "@/components/crud/time-field";
import { RequiredLabel } from "@/components/crud/required-label";
import { updateEvent } from "@/app/(app)/eventos/actions";

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
  event: Event;
  eventTypes: EventType[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    startTransition(async () => {
      const result = await updateEvent(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <LoadingOverlay show={pending} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Campos com <span className="text-destructive">*</span> são obrigatórios.
          </p>
        </DialogHeader>

        <form action={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <input type="hidden" name="id" value={event.id} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <RequiredLabel>Tipo</RequiredLabel>
            <Select
              name="event_type_id"
              defaultValue={event.event_type_id}
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
            <RequiredLabel htmlFor="title">Título</RequiredLabel>
            <Input id="title" name="title" ref={titleRef} required defaultValue={event.title} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" defaultValue={event.description ?? ""} />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <RequiredLabel htmlFor="date">Data</RequiredLabel>
              <Input id="date" name="date" type="date" required defaultValue={event.date} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Hora início (opcional)</Label>
            <TimeField name="start_time" defaultValue={event.start_time} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Hora fim (opcional)</Label>
            <TimeField name="end_time" defaultValue={event.end_time} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Local</Label>
            <Input id="location" name="location" defaultValue={event.location ?? ""} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
