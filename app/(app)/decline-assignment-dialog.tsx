"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PersonPicker, type Person } from "@/components/crud/person-picker";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { isValidDeclineReason } from "@/lib/domain/decline-reason";
import { respondToAssignment } from "./eventos/actions";

/**
 * Recusa de escala — reusado na Home (próxima escala) e na tela do evento
 * (assignment-card.tsx). Justificativa exige 3+ palavras (checado aqui pra
 * feedback imediato, e de novo no banco em respond_to_assignment — ver
 * migration 0028); substituto é opcional. Ao confirmar, o banco já lança
 * automaticamente a entrada no Semeando Tempo, nada a fazer aqui além de
 * chamar `respondToAssignment`.
 */
export function DeclineAssignmentDialog({
  id,
  eventId,
  volunteers,
  trigger,
}: {
  id: string;
  eventId: string;
  volunteers: Person[];
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const router = useRouter();

  const reasonValid = isValidDeclineReason(justification);

  function handleSubmit(formData: FormData) {
    setError(null);
    if (!isValidDeclineReason(justification)) {
      setError("Escreva uma justificativa com pelo menos 3 palavras.");
      return;
    }
    formData.set("status", "declined");
    startTransition(async () => {
      const result = await respondToAssignment(formData);
      if (result?.error) {
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
            trigger ?? (
              <Button type="button" size="sm" variant="outline">
                <X className="size-4" />
                Recusar
              </Button>
            )
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar escala</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="event_id" value={eventId} />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="justification">Motivo (mínimo 3 palavras)</Label>
              <Input
                id="justification"
                name="justification"
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                aria-invalid={justification.length > 0 && !reasonValid}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Sugerir substituto (opcional)</Label>
              <PersonPicker name="substitute_user_id" people={volunteers} triggerLabel="Buscar voluntário" />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={pending || !reasonValid}>
                {pending ? "Enviando..." : "Confirmar recusa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
