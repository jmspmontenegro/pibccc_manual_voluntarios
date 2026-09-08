"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { declineTerm } from "./terms-actions";

export function DeclineTermButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !window.confirm(
        "Tem certeza que quer recusar? Você será desconectado e seu acesso ficará bloqueado até a coordenação liberar de novo."
      )
    ) {
      return;
    }
    startTransition(() => declineTerm());
  }

  return (
    <>
      <LoadingOverlay show={pending} />
      <Button
        type="button"
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        disabled={pending}
        onClick={handleClick}
      >
        Recusar
      </Button>
    </>
  );
}
