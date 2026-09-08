import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { NewEventForm, type ExistingEvent } from "../../novo/new-event-form";

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
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
  if (!can(perms, "eventos", "edit")) redirect("/");

  const canCreateScale = can(perms, "escalas", "edit");

  const { data: event } = await supabase
    .from("events")
    .select("id, event_type_id, title, description, date, start_time, end_time, location")
    .eq("id", id)
    .single();
  if (!event) notFound();

  const { data: scale } = await supabase
    .from("scales")
    .select("id, script_url")
    .eq("event_id", id)
    .maybeSingle();

  const [{ data: scaleRooms }, { data: scaleTeams }, { data: assignments }] = scale
    ? await Promise.all([
        supabase.from("scale_rooms").select("room_id").eq("scale_id", scale.id),
        supabase.from("scale_teams").select("team_id").eq("scale_id", scale.id),
        supabase
          .from("scale_assignments")
          .select("user_id, room_id")
          .eq("scale_id", scale.id)
          .not("user_id", "is", null),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const existingEvent: ExistingEvent = {
    id: event.id,
    event_type_id: event.event_type_id,
    title: event.title,
    description: event.description,
    date: event.date,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
    scriptUrl: scale?.script_url ?? null,
    roomIds: (scaleRooms ?? []).map((r) => r.room_id),
    teamIds: (scaleTeams ?? []).map((t) => t.team_id),
    participants: (assignments ?? []).map((a) => ({
      user_id: a.user_id as string,
      room_id: a.room_id,
    })),
  };

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const { data: teams } = await supabase.from("teams").select("id, name, color").order("name");

  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");

  const { data: volunteers } = await supabase
    .from("profiles")
    .select("id, full_name, email, team_id, preferred_room_id")
    .eq("status", "approved")
    .order("full_name");

  // Elenco real de cada equipe hoje é o campo "equipe principal"
  // (profiles.team_id), não team_members — ver mesma nota em novo/page.tsx.
  const membersByTeam: Record<string, { id: string; full_name: string | null; email: string; team_id: string | null; preferred_room_id: string | null }[]> = {};
  for (const v of volunteers ?? []) {
    if (!v.team_id) continue;
    (membersByTeam[v.team_id] ??= []).push({
      id: v.id,
      full_name: v.full_name,
      email: v.email,
      team_id: v.team_id,
      preferred_room_id: v.preferred_room_id,
    });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-24 sm:p-6">
      <a
        href="/admin/eventos"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Eventos
      </a>

      <div>
        <h1 className="font-serif text-2xl font-bold">Editar evento</h1>
        <p className="text-sm text-muted-foreground">{event.title}</p>
      </div>

      <NewEventForm
        eventTypes={eventTypes ?? []}
        teams={teams ?? []}
        membersByTeam={membersByTeam}
        rooms={rooms ?? []}
        volunteers={volunteers ?? []}
        templates={[]}
        canCreateScale={canCreateScale}
        existingEvent={existingEvent}
      />
    </main>
  );
}
