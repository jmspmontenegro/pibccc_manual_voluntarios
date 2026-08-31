"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createScale } from "../actions";

export function CreateScaleForm({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createScale(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button type="button" size="sm" className="mt-3" onClick={() => setOpen(true)}>
        Criar escala
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="mt-3 flex flex-col gap-3 text-left">
      <input type="hidden" name="event_id" value={eventId} />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome da escala</Label>
        <Input id="name" name="name" required defaultValue="Escala" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="script_url">Link do roteiro (opcional)</Label>
        <Input id="script_url" name="script_url" type="url" placeholder="https://drive.google.com/..." />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Criando..." : "Salvar"}
      </Button>
    </form>
  );
}
