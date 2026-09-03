"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Users2 } from "lucide-react";
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
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { respondToRsvp } from "../actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando resposta",
  confirmed: "Presença confirmada",
  declined: "Presença recusada",
};
const STATUS_VARIANT: Record<string, "default" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  declined: "destructive",
};

export function RsvpCard({
  eventId,
  status,
  confirmedCount,
}: {
  eventId: string;
  status: string;
  confirmedCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [declineOpen, setDeclineOpen] = useState(false);
  const router = useRouter();

  function confirm() {
    const formData = new FormData();
    formData.set("event_id", eventId);
    formData.set("status", "confirmed");
    startTransition(async () => {
      await respondToRsvp(formData);
      router.refresh();
    });
  }

  function handleDecline(formData: FormData) {
    formData.set("event_id", eventId);
    formData.set("status", "declined");
    startTransition(async () => {
      await respondToRsvp(formData);
      setDeclineOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <LoadingOverlay show={pending} />
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users2 className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Você vai participar?</p>
          <p className="text-xs text-muted-foreground">{confirmedCount} confirmado(s)</p>
        </div>
      </div>

      <Badge variant={STATUS_VARIANT[status]} className="w-fit">
        {STATUS_LABEL[status]}
      </Badge>

      {status === "pending" && (
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={pending} onClick={confirm}>
            <Check className="size-4" />
            Confirmar presença
          </Button>
          <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
            <DialogTrigger render={<Button type="button" size="sm" variant="outline" />}>
              <X className="size-4" />
              Recusar
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recusar participação</DialogTitle>
              </DialogHeader>
              <form action={handleDecline} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="justification">Motivo (opcional)</Label>
                  <Input id="justification" name="justification" />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="destructive" disabled={pending}>
                    {pending ? "Enviando..." : "Confirmar recusa"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      </div>
    </>
  );
}
