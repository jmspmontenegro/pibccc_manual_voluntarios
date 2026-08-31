"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { updateEntry, deleteEntry } from "./actions";

type Entry = { id: string; entered_at: string; note: string | null };

function EntryRow({ entry, editable }: { entry: Entry; editable: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateEntry(formData);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-2 border-b py-2 last:border-0">
      <input type="hidden" name="id" value={entry.id} />
      <Input
        name="entered_at"
        type="date"
        defaultValue={entry.entered_at}
        disabled={!editable}
        className="w-36"
      />
      <Input
        name="note"
        defaultValue={entry.note ?? ""}
        disabled={!editable}
        placeholder="Observação"
        className="flex-1"
      />
      {editable && (
        <>
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            Salvar
          </Button>
          <DeleteButton id={entry.id} action={deleteEntry} confirmMessage="Excluir esta entrada?" />
        </>
      )}
    </form>
  );
}

export function HistoryDialog({
  name,
  entries,
  editable,
}: {
  name: string;
  entries: Entry[];
  editable: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm">
            <History className="size-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico — {name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} editable={editable} />
          ))}
          {entries.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma entrada.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
