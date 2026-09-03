"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { getDocumentUrl } from "./actions";

export function DownloadButton({ filePath }: { filePath: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file_path", filePath);
      const { url } = await getDocumentUrl(formData);
      if (url) window.open(url, "_blank");
    });
  }

  return (
    <>
      <LoadingOverlay show={pending} />
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleClick}>
        <Download className="size-4" />
        {pending ? "Abrindo..." : "Baixar"}
      </Button>
    </>
  );
}
