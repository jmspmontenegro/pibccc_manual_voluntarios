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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonPicker, type Person } from "@/components/crud/person-picker";
import { DeleteButton } from "@/components/crud/delete-button";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { addEntry, updateEntry, deleteEntry } from "./actions";

type Entry = {
  id: string;
  entered_at: string;
  note: string | null;
  userId: string;
  name: string;
  email: string;
};

export function EntryFormDialog({
  entry,
  volunteers,
}: {
  entry?: Entry;
  volunteers?: Person[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = entry ? updateEntry : addEntry;
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
          entry ? (
            <Button type="button" variant="ghost" size="icon-sm">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button type="button">
              <Plus className="size-4" />
              Adicionar voluntário
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {entry ? `Editar entrada — ${entry.name}` : "Adicionar ao Semeando Tempo"}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {entry && <input type="hidden" name="id" value={entry.id} />}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!entry ? (
            <div className="flex flex-col gap-1.5">
              <Label>Voluntário</Label>
              <PersonPicker name="user_id" people={volunteers ?? []} />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label>Voluntário</Label>
              <p className="text-sm font-medium">{entry.name}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entered_at">Data da falta</Label>
            <Input
              id="entered_at"
              name="entered_at"
              type="date"
              defaultValue={entry?.entered_at ?? new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Motivo da Falta</Label>
            <Input id="note" name="note" defaultValue={entry?.note ?? ""} required />
          </div>

          <DialogFooter>
            {entry && (
              <DeleteButton
                id={entry.id}
                action={deleteEntry}
                confirmMessage={`Excluir esta entrada de ${entry.name}?`}
              />
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : entry ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
