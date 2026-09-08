"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { DeclineAssignmentDialog } from "./decline-assignment-dialog";
import { respondToAssignment } from "./eventos/actions";
import type { Person } from "@/components/crud/person-picker";

/**
 * Ações de confirmar/recusar direto no card "Sua próxima escala" da Home —
 * mesma lógica de app/(app)/eventos/[id]/assignment-card.tsx, só o visual
 * muda pra caber no card roxo da Home.
 */
export function NextAssignmentActions({
  assignmentId,
  eventId,
  volunteers,
}: {
  assignmentId: string;
  eventId: string;
  volunteers: Person[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("id", assignmentId);
    formData.set("event_id", eventId);
    formData.set("status", "confirmed");
    startTransition(async () => {
      await respondToAssignment(formData);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <LoadingOverlay show={pending} />
      <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={handleConfirm}>
        <Check className="size-4" />
        Confirmar
      </Button>
      <DeclineAssignmentDialog
        id={assignmentId}
        eventId={eventId}
        volunteers={volunteers}
        trigger={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            Recusar
          </Button>
        }
      />
    </div>
  );
}
