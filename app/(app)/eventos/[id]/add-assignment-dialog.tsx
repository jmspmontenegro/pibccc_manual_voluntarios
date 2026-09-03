"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
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
import { PersonPicker, type Person } from "@/components/crud/person-picker";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { addAssignment } from "../actions";

type Room = { id: string; name: string };

export function AddAssignmentDialog({
  scaleId,
  eventId,
  volunteers,
  rooms,
}: {
  scaleId: string;
  eventId: string;
  volunteers: Person[];
  rooms: Room[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addAssignment(formData);
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
          <Button type="button" variant="outline" size="sm">
            <UserPlus className="size-4" />
            Adicionar voluntário
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar voluntário à escala</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="scale_id" value={scaleId} />
          <input type="hidden" name="event_id" value={eventId} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Voluntário</Label>
            <PersonPicker name="user_id" people={volunteers} />
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
            <Input id="role" name="role" placeholder="Ex: Responsável, Apoio..." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
