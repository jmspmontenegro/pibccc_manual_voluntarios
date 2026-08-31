"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  id,
  action,
  confirmMessage = "Tem certeza que deseja excluir?",
}: {
  id: string;
  action: (formData: FormData) => Promise<{ error: string | null }>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      const result = await action(formData);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      onClick={handleClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
