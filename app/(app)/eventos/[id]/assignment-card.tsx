"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeamBadge } from "@/components/team-badge";
import { PersonPicker, type Person } from "@/components/crud/person-picker";
import { DeleteButton } from "@/components/crud/delete-button";
import { respondToAssignment, updateAssignment, deleteAssignment } from "../actions";

const CONFIRMATION_LABEL: Record<string, string> = {
  pending: "Aguardando",
  confirmed: "Confirmado",
  declined: "Recusado",
};
const CONFIRMATION_VARIANT: Record<string, "default" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  declined: "destructive",
};
const ATTENDANCE_LABEL: Record<string, string> = {
  not_marked: "Presença não marcada",
  present: "Compareceu",
  absent: "Faltou",
};

export type Assignment = {
  id: string;
  name: string;
  teamName: string | null;
  teamColor: string | null;
  roomName: string | null;
  role: string | null;
  confirmation_status: string;
  justification: string | null;
  attendance_status: string;
};

function DeclineDialog({ id, eventId, volunteers }: { id: string; eventId: string; volunteers: Person[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    formData.set("status", "declined");
    startTransition(async () => {
      await respondToAssignment(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" />}>
        <X className="size-4" />
        Recusar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recusar escala</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="event_id" value={eventId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="justification">Motivo</Label>
            <Input id="justification" name="justification" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sugerir substituto (opcional)</Label>
            <PersonPicker name="substitute_user_id" people={volunteers} triggerLabel="Buscar voluntário" />
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Enviando..." : "Confirmar recusa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ManageDialog({
  assignment,
  eventId,
  rooms,
}: {
  assignment: Assignment;
  eventId: string;
  rooms: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateAssignment(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
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
          <DialogTitle>{assignment.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={assignment.id} />
          <input type="hidden" name="event_id" value={eventId} />

          <div className="flex flex-col gap-1.5">
            <Label>Sala</Label>
            <Select
              name="room_id"
              defaultValue={rooms.find((r) => r.name === assignment.roomName)?.id}
              items={Object.fromEntries(rooms.map((r) => [r.id, r.name]))}
            >
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
            <Label htmlFor="role">Função</Label>
            <Input id="role" name="role" defaultValue={assignment.role ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Presença</Label>
            <Select
              name="attendance_status"
              defaultValue={assignment.attendance_status}
              items={ATTENDANCE_LABEL}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ATTENDANCE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {assignment.justification && (
            <p className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
              Motivo da recusa: {assignment.justification}
            </p>
          )}

          <DialogFooter>
            <DeleteButton
              id={assignment.id}
              action={deleteAssignment}
              confirmMessage={`Remover ${assignment.name} desta escala?`}
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssignmentCard({
  assignment,
  eventId,
  isOwn,
  canManage,
  rooms,
  volunteers,
}: {
  assignment: Assignment;
  eventId: string;
  isOwn: boolean;
  canManage: boolean;
  rooms: { id: string; name: string }[];
  volunteers: Person[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("id", assignment.id);
    formData.set("event_id", eventId);
    formData.set("status", "confirmed");
    startTransition(async () => {
      await respondToAssignment(formData);
      router.refresh();
    });
  }

  const initial = assignment.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold leading-tight">{assignment.name}</p>
            <p className="text-xs text-muted-foreground">
              {assignment.roomName ?? "Sem sala"}
              {assignment.role ? ` · ${assignment.role}` : ""}
            </p>
          </div>
        </div>
        {canManage && <ManageDialog assignment={assignment} eventId={eventId} rooms={rooms} />}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {assignment.teamName && assignment.teamColor && (
          <TeamBadge name={assignment.teamName} color={assignment.teamColor} />
        )}
        <Badge variant={CONFIRMATION_VARIANT[assignment.confirmation_status]}>
          {CONFIRMATION_LABEL[assignment.confirmation_status]}
        </Badge>
        {assignment.attendance_status !== "not_marked" && (
          <Badge variant="secondary">{ATTENDANCE_LABEL[assignment.attendance_status]}</Badge>
        )}
      </div>

      {isOwn && assignment.confirmation_status === "pending" && (
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={pending} onClick={handleConfirm}>
            <Check className="size-4" />
            Confirmar
          </Button>
          <DeclineDialog id={assignment.id} eventId={eventId} volunteers={volunteers} />
        </div>
      )}
    </div>
  );
}
