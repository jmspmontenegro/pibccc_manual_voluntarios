import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { ListToolbar } from "@/components/crud/list-toolbar";
import { DeleteButton } from "@/components/crud/delete-button";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "./event-form-dialog";
import { deleteEvent } from "@/app/(app)/eventos/actions";

export default async function AdminEventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = "date_desc" } = await searchParams;
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
  if (!can(perms, "eventos", "view")) redirect("/");

  let query = supabase
    .from("events")
    .select(
      "id, event_type_id, title, description, date, start_time, end_time, location, event_type:event_types(name)"
    );

  if (q) query = query.ilike("title", `%${q}%`);
  query = query.order("date", { ascending: sort !== "date_desc" });

  const { data: events } = await query;
  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const canCreate = can(perms, "eventos", "create");
  const canEdit = can(perms, "eventos", "edit");
  const canDelete = can(perms, "eventos", "delete");

  const rows = (events ?? []).map((e) => ({
    ...e,
    typeName: (e as any).event_type?.name ?? "",
    dateLabel: new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR"),
  }));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Eventos</h1>
        {canCreate && (
          <a href="/admin/eventos/novo">
            <Button type="button">
              <Plus className="size-4" />
              Novo evento
            </Button>
          </a>
        )}
      </div>

      <ListToolbar
        searchPlaceholder="Buscar evento..."
        sortOptions={[
          { value: "date_desc", label: "Mais recentes" },
          { value: "date_asc", label: "Mais antigos" },
        ]}
        data={rows.map((r) => ({
          Título: r.title,
          Tipo: r.typeName,
          Data: r.dateLabel,
          Local: r.location ?? "",
        }))}
        filename="eventos"
      />

      <div className="print-area flex flex-col gap-3">
        {rows.map((e) => (
          <div
            key={e.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <a href={`/eventos/${e.id}`} className="flex flex-1 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </span>
              <div>
                <p className="font-semibold leading-tight">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {e.typeName} · {e.dateLabel}
                  {e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ""}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
            </a>
            {(canEdit || canDelete) && (
              <div className="flex gap-1">
                {canEdit && (
                  <EventFormDialog
                    event={{
                      id: e.id,
                      event_type_id: e.event_type_id,
                      title: e.title,
                      description: e.description,
                      date: e.date,
                      start_time: e.start_time,
                      end_time: e.end_time,
                      location: e.location,
                    }}
                    eventTypes={eventTypes ?? []}
                  />
                )}
                {canDelete && (
                  <DeleteButton
                    id={e.id}
                    action={deleteEvent}
                    confirmMessage={`Excluir o evento "${e.title}"?`}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum evento cadastrado.
          </p>
        )}
      </div>
    </main>
  );
}
