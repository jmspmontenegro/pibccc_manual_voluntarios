"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
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
import { createEventType, updateEventType } from "./actions";

type EventType = { id: string; name: string; description: string | null; active: boolean };

export function TypeFormDialog({ eventType }: { eventType?: EventType }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = eventType ? updateEventType : createEventType;
      const result = await action(formData);
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
          eventType ? (
            <Button type="button" variant="ghost" size="icon-sm">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button type="button">
              <Plus className="size-4" />
              Novo tipo
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{eventType ? "Editar tipo de evento" : "Novo tipo de evento"}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {eventType && <input type="hidden" name="id" value={eventType.id} />}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required defaultValue={eventType?.name} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={eventType?.description ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select
              name="active"
              defaultValue={eventType ? String(eventType.active) : "true"}
              items={{ true: "Ativo", false: "Inativo" }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
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
