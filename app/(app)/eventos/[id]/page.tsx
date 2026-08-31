import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { AssignmentCard, type Assignment } from "./assignment-card";
import { AddAssignmentDialog } from "./add-assignment-dialog";
import { AddTeamAssignmentDialog } from "./add-team-assignment-dialog";
import { CreateScaleForm } from "./create-scale-form";
import { RsvpCard } from "./rsvp-card";
import { ChecklistSection } from "./checklist-section";
import { RoteiroSection } from "./roteiro-section";

export default async function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const canManage = can(perms, "escalas", "create") || can(perms, "escalas", "edit");
  const canCreateScale = can(perms, "escalas", "create");

  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, date, start_time, end_time, location, event_type:event_types(name)")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const { data: scales } = await supabase
    .from("scales")
    .select("id, name, status, script_url, script_file_path")
    .eq("event_id", id)
    .order("created_at");

  const scaleIds = (scales ?? []).map((s) => s.id);

  const { data: assignmentsRaw } = scaleIds.length
    ? await supabase
        .from("scale_assignments")
        .select(
          "id, scale_id, user_id, team_id, room_id, role, confirmation_status, justification, attendance_status, profile:profiles!scale_assignments_user_id_fkey(full_name, email), team:teams(name, color), room:rooms(name)"
        )
        .in("scale_id", scaleIds)
    : { data: [] };

  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");
  const { data: teams } = await supabase.from("teams").select("id, name, color").order("name");
  const { data: teamMembersRaw } = await supabase
    .from("team_members")
    .select("team_id, profile:profiles!team_members_user_id_fkey(id, full_name, email)")
    .eq("active", true);

  const { data: volunteers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("status", "approved")
    .order("full_name");

  const membersByTeam: Record<string, { id: string; full_name: string | null; email: string }[]> = {};
  for (const tm of teamMembersRaw ?? []) {
    const profile = (tm as any).profile;
    if (!profile) continue;
    (membersByTeam[tm.team_id] ??= []).push(profile);
  }

  let myRsvpStatus = "pending";
  let confirmedRsvpCount = 0;
  if (scaleIds.length === 0) {
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("user_id, status")
      .eq("event_id", id);
    confirmedRsvpCount = (rsvps ?? []).filter((r) => r.status === "confirmed").length;
    myRsvpStatus = (rsvps ?? []).find((r) => r.user_id === user!.id)?.status ?? "pending";
  }

  const { data: scaleChecklistsRaw } = scaleIds.length
    ? await supabase
        .from("scale_checklists")
        .select(
          "id, scale_id, name, items:scale_checklist_items(id, label, checked, checked_by, position, checked_profile:profiles!scale_checklist_items_checked_by_fkey(full_name, email))"
        )
        .in("scale_id", scaleIds)
    : { data: [] };

  const { data: templates } = canManage
    ? await supabase.from("checklist_templates").select("id, name").order("name")
    : { data: [] };

  const checklistByScale = new Map<string, { id: string; name: string; items: any[] }>();
  for (const c of scaleChecklistsRaw ?? []) {
    const items = ((c as any).items ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((i: any) => ({
        id: i.id,
        label: i.label,
        checked: i.checked,
        checkedByName: i.checked_profile?.full_name || i.checked_profile?.email || null,
      }));
    checklistByScale.set(c.scale_id, { id: c.id, name: c.name, items });
  }

  const eventTypeName = (event as any).event_type?.name ?? "";
  const dateLabel = new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <a href="/eventos" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Eventos
      </a>

      <div className="flex flex-col gap-2 rounded-2xl bg-primary p-5 text-primary-foreground">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          {eventTypeName}
        </span>
        <h1 className="font-serif text-2xl font-bold">{event.title}</h1>
        <p className="flex items-center gap-1.5 text-sm text-white/90">
          <CalendarDays className="size-4" />
          {dateLabel}
          {event.start_time ? ` · ${event.start_time.slice(0, 5)}` : ""}
        </p>
        {event.location && (
          <p className="flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="size-4" />
            {event.location}
          </p>
        )}
        {event.description && <p className="text-sm text-white/85">{event.description}</p>}
      </div>

      {(scales ?? []).length === 0 && (
        <>
          <RsvpCard eventId={event.id} status={myRsvpStatus} confirmedCount={confirmedRsvpCount} />
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            Este evento ainda não tem escala.
            {canCreateScale && <CreateScaleForm eventId={event.id} />}
          </div>
        </>
      )}

      {(scales ?? []).map((scale) => {
        const assignments: Assignment[] = (assignmentsRaw ?? [])
          .filter((a) => a.scale_id === scale.id)
          .map((a) => {
            const profile = (a as any).profile;
            const team = (a as any).team;
            const room = (a as any).room;
            return {
              id: a.id,
              name: profile?.full_name || profile?.email || team?.name || "(sem nome)",
              teamName: team?.name ?? null,
              teamColor: team?.color ?? null,
              roomName: room?.name ?? null,
              role: a.role,
              confirmation_status: a.confirmation_status,
              justification: a.justification,
              attendance_status: a.attendance_status,
              _userId: a.user_id,
            } as Assignment & { _userId: string | null };
          });

        return (
          <section key={scale.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold">{scale.name}</h2>
              <RoteiroSection
                scaleId={scale.id}
                eventId={event.id}
                scriptUrl={scale.script_url}
                scriptFilePath={scale.script_file_path}
                canManage={canManage}
              />
            </div>

            {canManage && (
              <div className="flex flex-wrap gap-2">
                <AddAssignmentDialog
                  scaleId={scale.id}
                  eventId={event.id}
                  volunteers={volunteers ?? []}
                  rooms={rooms ?? []}
                />
                <AddTeamAssignmentDialog
                  scaleId={scale.id}
                  eventId={event.id}
                  teams={teams ?? []}
                  membersByTeam={membersByTeam}
                  rooms={rooms ?? []}
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {assignments.map((a: any) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  eventId={event.id}
                  isOwn={a._userId === user!.id}
                  canManage={canManage}
                  rooms={rooms ?? []}
                  volunteers={volunteers ?? []}
                />
              ))}
              {assignments.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Ninguém escalado ainda.
                </p>
              )}
            </div>

            <ChecklistSection
              scaleId={scale.id}
              eventId={event.id}
              checklist={checklistByScale.get(scale.id) ?? null}
              templates={templates ?? []}
              canManage={canManage}
            />
          </section>
        );
      })}
    </main>
  );
}
