"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, KeyRound, Copy } from "lucide-react";
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
import { updateUser, resetPassword } from "./actions";

type Team = { id: string; name: string };
type Room = { id: string; name: string };
type SemeandoTempoRecord = { id: string; entered_at: string; note: string | null };

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string;
  address: string | null;
  role: string;
  status: string;
  team_id: string | null;
  preferred_room_id: string | null;
  birth_date: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "blocked", label: "Bloqueado" },
];

const ROLE_OPTIONS = [
  { value: "volunteer", label: "Voluntário" },
  { value: "leader", label: "Supervisor" },
  { value: "coordinator", label: "Coordenação" },
  { value: "admin", label: "Administrador" },
];

export function UserEditDialog({
  profile,
  teams,
  rooms,
  semeandoTempoHistory,
}: {
  profile: Profile;
  teams: Team[];
  rooms: Room[];
  semeandoTempoHistory: SemeandoTempoRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [resetting, startResetTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateUser(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function handleResetPassword() {
    if (!window.confirm(`Gerar uma nova senha temporária para ${profile.full_name || profile.email}?`))
      return;
    startResetTransition(async () => {
      const formData = new FormData();
      formData.set("id", profile.id);
      const result = await resetPassword(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNewPassword(result.password);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setNewPassword(null);
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{profile.full_name || profile.email}</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={profile.id} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {newPassword && (
            <Alert>
              <AlertDescription className="flex items-center justify-between gap-2">
                <span>
                  Nova senha temporária: <strong>{newPassword}</strong>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => navigator.clipboard.writeText(newPassword)}
                >
                  <Copy className="size-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Nome completo</Label>
            <Input name="full_name" defaultValue={profile.full_name ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Telefone</Label>
            <Input name="phone" type="tel" required defaultValue={profile.phone ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Endereço</Label>
            <Input name="address" defaultValue={profile.address ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Data de nascimento</Label>
            <Input name="birth_date" type="date" defaultValue={profile.birth_date ?? ""} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Sala preferencial</Label>
            <Select
              name="preferred_room_id"
              defaultValue={profile.preferred_room_id ?? undefined}
              items={Object.fromEntries(rooms.map((r) => [r.id, r.name]))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem preferência" />
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
            <Label>Equipe</Label>
            <Select
              name="team_id"
              defaultValue={profile.team_id ?? undefined}
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

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Perfil</Label>
              <Select
                name="role"
                defaultValue={profile.role}
                items={Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Acesso</Label>
              <Select
                name="status"
                defaultValue={profile.status}
                items={Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="justify-start"
            disabled={resetting}
            onClick={handleResetPassword}
          >
            <KeyRound className="size-4" />
            {resetting ? "Gerando..." : "Redefinir senha"}
          </Button>

          {semeandoTempoHistory.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Histórico Semeando Tempo</Label>
              <div className="flex flex-col gap-1 rounded-lg border p-2 text-sm">
                {semeandoTempoHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">
                      {new Date(h.entered_at + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex-1 truncate text-right">{h.note}</span>
                  </div>
                ))}
              </div>
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
