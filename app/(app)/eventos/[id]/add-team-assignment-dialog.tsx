"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
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
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { addTeamAssignments } from "../actions";

type Team = { id: string; name: string; color: string };
type Member = { id: string; full_name: string | null; email: string };
type Room = { id: string; name: string };

export function AddTeamAssignmentDialog({
  scaleId,
  eventId,
  teams,
  membersByTeam,
  rooms,
}: {
  scaleId: string;
  eventId: string;
  teams: Team[];
  membersByTeam: Record<string, Member[]>;
  rooms: Room[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const members = useMemo(() => (teamId ? membersByTeam[teamId] ?? [] : []), [teamId, membersByTeam]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    if (selected.size === 0) {
      setError("Selecione ao menos um membro.");
      return;
    }
    for (const id of selected) formData.append("user_ids", id);

    startTransition(async () => {
      const result = await addTeamAssignments(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setSelected(new Set());
      setTeamId(null);
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
            <Users className="size-4" />
            Adicionar equipe
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escalar equipe</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="scale_id" value={scaleId} />
          <input type="hidden" name="event_id" value={eventId} />
          {teamId && <input type="hidden" name="team_id" value={teamId} />}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Equipe</Label>
            <Select
              onValueChange={(v) => {
                setTeamId(v as string);
                setSelected(new Set());
              }}
              items={Object.fromEntries(teams.map((t) => [t.id, t.name]))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a equipe..." />
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
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.has(m.id)}
                    onCheckedChange={() => toggle(m.id)}
                  />
                  {m.full_name || m.email}
                </label>
              ))}
              {members.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  Essa equipe ainda não tem membros cadastrados.
                </p>
              )}
            </div>
          )}

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

          <DialogFooter>
            <Button type="submit" disabled={pending || !teamId}>
              {pending ? "Adicionando..." : `Adicionar selecionados (${selected.size})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
