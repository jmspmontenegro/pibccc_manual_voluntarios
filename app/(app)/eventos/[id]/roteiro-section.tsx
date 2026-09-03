"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { getScaleScriptUrl, uploadScaleScript } from "../actions";

export function RoteiroSection({
  scaleId,
  eventId,
  scriptUrl,
  scriptFilePath,
  canManage,
}: {
  scaleId: string;
  eventId: string;
  scriptUrl: string | null;
  scriptFilePath: string | null;
  canManage: boolean;
}) {
  const [opening, startOpenTransition] = useTransition();
  const [uploading, startUploadTransition] = useTransition();
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();

  function openFile() {
    const formData = new FormData();
    formData.set("file_path", scriptFilePath!);
    startOpenTransition(async () => {
      const { url } = await getScaleScriptUrl(formData);
      if (url) window.open(url, "_blank");
    });
  }

  function handleUpload(formData: FormData) {
    formData.set("scale_id", scaleId);
    formData.set("event_id", eventId);
    startUploadTransition(async () => {
      await uploadScaleScript(formData);
      setShowUpload(false);
      router.refresh();
    });
  }

  if (scriptUrl) {
    return (
      <>
        <LoadingOverlay show={opening || uploading} />
        <a
          href={scriptUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-primary"
        >
          <LinkIcon className="size-3.5" />
          Roteiro
        </a>
      </>
    );
  }

  if (scriptFilePath) {
    return (
      <>
        <LoadingOverlay show={opening || uploading} />
        <button
          type="button"
          onClick={openFile}
          disabled={opening}
          className="flex items-center gap-1 text-xs font-medium text-primary"
        >
          <LinkIcon className="size-3.5" />
          {opening ? "Abrindo..." : "Roteiro"}
        </button>
      </>
    );
  }

  if (!canManage) return null;

  if (!showUpload) {
    return (
      <>
        <LoadingOverlay show={opening || uploading} />
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
        >
          <Upload className="size-3.5" />
          Adicionar roteiro
        </button>
      </>
    );
  }

  return (
    <>
      <LoadingOverlay show={opening || uploading} />
      <form action={handleUpload} className="flex items-center gap-2">
        <Input name="file" type="file" className="h-8 text-xs" />
        <Button type="submit" size="sm" disabled={uploading}>
          {uploading ? "..." : "Enviar"}
        </Button>
      </form>
    </>
  );
}
