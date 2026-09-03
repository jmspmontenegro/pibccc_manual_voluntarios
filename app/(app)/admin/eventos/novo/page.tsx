import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { NewEventForm } from "./new-event-form";

export default async function NovoEventoPage() {
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
  if (!can(perms, "eventos", "create")) redirect("/");

  const canCreateScale = can(perms, "escalas", "create");

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const { data: teams } = await supabase.from("teams").select("id, name, color").order("name");

  const { data: teamMembersRaw } = await supabase
    .from("team_members")
    .select("team_id, profile:profiles!team_members_user_id_fkey(id, full_name, email)")
    .eq("active", true);

  const membersByTeam: Record<string, { id: string; full_name: string | null; email: string }[]> = {};
  for (const tm of teamMembersRaw ?? []) {
    const profile = (tm as any).profile;
    if (!profile) continue;
    (membersByTeam[tm.team_id] ??= []).push(profile);
  }

  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name");

  const { data: volunteers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("status", "approved")
    .order("full_name");

  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("id, name")
    .order("name");

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
        <h1 className="font-serif text-2xl font-bold">Novo evento</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre o evento e já deixe a escala pronta.
        </p>
      </div>

      <NewEventForm
        eventTypes={eventTypes ?? []}
        teams={teams ?? []}
        membersByTeam={membersByTeam}
        rooms={rooms ?? []}
        volunteers={volunteers ?? []}
        templates={templates ?? []}
        canCreateScale={canCreateScale}
      />
    </main>
  );
}
