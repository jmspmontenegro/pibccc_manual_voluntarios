import { redirect } from "next/navigation";
import { ArrowLeft, Tags } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { TypeFormDialog } from "./type-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { deleteEventType } from "./actions";

export default async function TiposEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = "name" } = await searchParams;
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
  if (!can(perms, "tipos_evento", "view")) redirect("/");

  let query = supabase.from("event_types").select("id, name, description, active");

  if (q) query = query.ilike("name", `%${q}%`);
  query = query.order(sort === "name" ? "name" : "created_at", {
    ascending: sort !== "created_at_desc",
  });

  const { data: eventTypes } = await query;

  const canCreate = can(perms, "tipos_evento", "create");
  const canEdit = can(perms, "tipos_evento", "edit");
  const canDelete = can(perms, "tipos_evento", "delete");

  const rows = eventTypes ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Tipos de Evento</h1>
        {canCreate && <TypeFormDialog />}
      </div>

      <ListToolbar
        searchPlaceholder="Buscar tipo..."
        sortOptions={[
          { value: "name", label: "Nome (A-Z)" },
          { value: "created_at_desc", label: "Mais recentes" },
        ]}
        data={rows.map((r) => ({
          Nome: r.name,
          Descrição: r.description ?? "",
          Status: r.active ? "Ativo" : "Inativo",
        }))}
        filename="tipos-evento"
      />

      <div className="print-area flex flex-col gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Tags className="size-5" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">{r.name}</p>
                  {r.description && (
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  )}
                </div>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex gap-1">
                  {canEdit && <TypeFormDialog eventType={r} />}
                  {canDelete && (
                    <DeleteButton
                      id={r.id}
                      action={deleteEventType}
                      confirmMessage={`Excluir o tipo "${r.name}"?`}
                    />
                  )}
                </div>
              )}
            </div>
            <Badge variant={r.active ? "default" : "outline"} className="w-fit">
              {r.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum tipo de evento cadastrado.
          </p>
        )}
      </div>
    </main>
  );
}
