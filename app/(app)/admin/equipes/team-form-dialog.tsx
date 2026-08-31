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
import { createTeam, updateTeam } from "./actions";

type Supervisor = { id: string; full_name: string | null; email: string };

type Team = {
  id: string;
  name: string;
  supervisor_id: string | null;
  color: string;
};

export function TeamFormDialog({
  team,
  supervisors,
}: {
  team?: Team;
  supervisors: Supervisor[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = team ? updateTeam : createTeam;
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          team ? (
            <Button type="button" variant="ghost" size="icon-sm">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button type="button">
              <Plus className="size-4" />
              Nova equipe
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{team ? "Editar equipe" : "Nova equipe"}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {team && <input type="hidden" name="id" value={team.id} />}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required defaultValue={team?.name} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Supervisor responsável</Label>
            <Select name="supervisor_id" defaultValue={team?.supervisor_id ?? undefined}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name || s.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="color">Cor do badge</Label>
            <div className="flex items-center gap-2">
              <input
                id="color"
                name="color"
                type="color"
                defaultValue={team?.color ?? "#8060FF"}
                className="h-9 w-14 rounded-md border border-input"
              />
              <span className="text-sm text-muted-foreground">
                Usada sempre que o nome da equipe aparecer como badge.
              </span>
            </div>
          </div>

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
