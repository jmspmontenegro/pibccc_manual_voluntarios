"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createScaleChecklistFromTemplate,
  createBlankScaleChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "../actions";

type Template = { id: string; name: string };
type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  checkedByName: string | null;
};

export function ChecklistSection({
  scaleId,
  eventId,
  checklist,
  templates,
  canManage,
}: {
  scaleId: string;
  eventId: string;
  checklist: { id: string; name: string; items: ChecklistItem[] } | null;
  templates: Template[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const router = useRouter();

  function useTemplate() {
    if (!templateId) return;
    const formData = new FormData();
    formData.set("scale_id", scaleId);
    formData.set("event_id", eventId);
    formData.set("template_id", templateId);
    startTransition(async () => {
      await createScaleChecklistFromTemplate(formData);
      router.refresh();
    });
  }

  function createBlank() {
    const formData = new FormData();
    formData.set("scale_id", scaleId);
    formData.set("event_id", eventId);
    startTransition(async () => {
      await createBlankScaleChecklist(formData);
      router.refresh();
    });
  }

  function toggle(id: string, checked: boolean) {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("event_id", eventId);
    formData.set("checked", String(checked));
    startTransition(async () => {
      await toggleChecklistItem(formData);
      router.refresh();
    });
  }

  function addItem() {
    if (!newLabel.trim() || !checklist) return;
    const formData = new FormData();
    formData.set("scale_checklist_id", checklist.id);
    formData.set("event_id", eventId);
    formData.set("label", newLabel);
    startTransition(async () => {
      await addChecklistItem(formData);
      setNewLabel("");
      router.refresh();
    });
  }

  function removeItem(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("event_id", eventId);
    startTransition(async () => {
      await deleteChecklistItem(formData);
      router.refresh();
    });
  }

  if (!checklist) {
    if (!canManage) return null;
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ClipboardCheck className="size-4" />
          Checklist da escala
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(v) => setTemplateId(v as string)} items={Object.fromEntries(templates.map((t) => [t.id, t.name]))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Usar modelo..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" disabled={!templateId || pending} onClick={useTemplate}>
            Aplicar
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={createBlank}>
            Criar em branco
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <ClipboardCheck className="size-4" />
        {checklist.name}
      </p>
      <div className="flex flex-col">
        {checklist.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 border-b py-2 last:border-0">
            <Checkbox
              checked={item.checked}
              disabled={!canManage || pending}
              onCheckedChange={(c) => toggle(item.id, c === true)}
            />
            <span className={`flex-1 text-sm ${item.checked ? "text-muted-foreground line-through" : ""}`}>
              {item.label}
            </span>
            {item.checkedByName && (
              <span className="text-xs text-muted-foreground">{item.checkedByName}</span>
            )}
            {canManage && (
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(item.id)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
        {checklist.items.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">Nenhum item ainda.</p>
        )}
      </div>
      {canManage && (
        <div className="flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Novo item..."
          />
          <Button type="button" size="icon" disabled={pending} onClick={addItem}>
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
