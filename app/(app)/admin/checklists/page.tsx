import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { DeleteButton } from "@/components/crud/delete-button";
import { TemplateFormDialog } from "./template-form-dialog";
import { deleteTemplate } from "./actions";

export default async function ChecklistsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const perms = await getRolePermissions(supabase, currentProfile!.role);
  if (!can(perms, "checklists", "view")) redirect("/");

  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("id, name, items:checklist_template_items(label, position)")
    .order("name");

  const canEdit = can(perms, "checklists", "edit");

  const rows = (templates ?? []).map((t) => ({
    ...t,
    items: ((t as any).items ?? []).sort((a: any, b: any) => a.position - b.position),
  }));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Checklists</h1>
        {canEdit && <TemplateFormDialog />}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ClipboardCheck className="size-5" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.items.length} {t.items.length === 1 ? "item" : "itens"}
                  </p>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <TemplateFormDialog
                    template={{ id: t.id, name: t.name, items: t.items.map((i: any) => i.label) }}
                  />
                  <DeleteButton
                    id={t.id}
                    action={deleteTemplate}
                    confirmMessage={`Excluir o checklist "${t.name}"?`}
                  />
                </div>
              )}
            </div>
            {t.items.length > 0 && (
              <ul className="ml-14 list-disc text-sm text-muted-foreground">
                {t.items.map((i: any, idx: number) => (
                  <li key={idx}>{i.label}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum checklist cadastrado.
          </p>
        )}
      </div>
    </main>
  );
}
