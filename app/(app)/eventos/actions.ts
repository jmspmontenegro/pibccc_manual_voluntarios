"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { sanitizeFilename } from "@/lib/storage";

async function requirePermission(domain: "eventos" | "escalas", action: "create" | "edit" | "delete") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const perms = await getRolePermissions(supabase, profile!.role);
  if (!can(perms, domain, action)) {
    return { ok: false as const, error: "Sem permissão para esta ação." };
  }
  return { ok: true as const, supabase, userId: user.id };
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function parseStringArray(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(typeof value === "string" ? value : "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.filter((item): item is string => typeof item === "string"))] : [];
  } catch {
    return [];
  }
}

function parseParticipants(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(typeof value === "string" ? value : "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { user_id: string; room_id: string | null } =>
        typeof item?.user_id === "string" && (typeof item.room_id === "string" || item.room_id === null)
      )
      .filter((item, index, items) => items.findIndex((candidate) => candidate.user_id === item.user_id) === index);
  } catch {
    return [];
  }
}

export async function createEventWithScale(formData: FormData) {
  const check = await requirePermission("eventos", "create");
  if (!check.ok) return { error: check.error };

  const event_type_id = formData.get("event_type_id") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const date = formData.get("date") as string;
  const start_time = (formData.get("start_time") as string) || null;
  const end_time = (formData.get("end_time") as string) || null;
  const location = (formData.get("location") as string) || null;
  const recurs = formData.get("recurs") === "true";
  const weeks = Math.max(1, Math.min(52, Number(formData.get("weeks")) || 1));

  const scaleCheck = await requirePermission("escalas", "create");
  const scriptUrl = (formData.get("script_url") as string) || null;
  const file = formData.get("file") as File | null;
  const hasFile = !!file && file.size > 0;
  const roomIds = parseStringArray(formData.get("room_ids"));
  const teamIds = parseStringArray(formData.get("team_ids"));
  const requestedParticipants = parseParticipants(formData.get("participants"));
  const checklistMode = (formData.get("checklist_mode") as string) || "none";
  const templateId = (formData.get("template_id") as string) || null;

  const { data: validRooms } = scaleCheck.ok && roomIds.length
    ? await check.supabase.from("rooms").select("id").in("id", roomIds)
    : { data: [] };
  if (scaleCheck.ok && (validRooms ?? []).length !== roomIds.length) return { error: "Uma das salas selecionadas não existe mais." };

  const { data: validTeams } = scaleCheck.ok && teamIds.length
    ? await check.supabase.from("teams").select("id").in("id", teamIds)
    : { data: [] };
  if (scaleCheck.ok && (validTeams ?? []).length !== teamIds.length) return { error: "Uma das equipes selecionadas não existe mais." };

  const participantIds = requestedParticipants.map((participant) => participant.user_id);
  const { data: participantProfiles } = scaleCheck.ok && participantIds.length
    ? await check.supabase.from("profiles").select("id, team_id").in("id", participantIds).eq("status", "approved")
    : { data: [] };
  if (scaleCheck.ok && (participantProfiles ?? []).length !== participantIds.length) return { error: "Um dos voluntários selecionados não está disponível." };

  const validRoomIds = new Set((validRooms ?? []).map((room) => room.id));
  if (scaleCheck.ok && requestedParticipants.some((participant) => participant.room_id && !validRoomIds.has(participant.room_id))) {
    return { error: "Todo voluntário deve ser atribuído somente a uma sala em operação." };
  }
  const profileById = new Map((participantProfiles ?? []).map((profile) => [profile.id, profile]));

  const count = recurs ? weeks : 1;
  const recurrence_group_id = recurs && weeks > 1 ? crypto.randomUUID() : null;

  const eventRows = Array.from({ length: count }, (_, i) => ({
    event_type_id,
    title,
    description,
    date: addDays(date, i * 7),
    start_time,
    end_time,
    location,
    recurrence_group_id,
    created_by: check.userId,
  }));

  const { data: insertedEvents, error: eventsError } = await check.supabase
    .from("events")
    .insert(eventRows)
    .select("id, date")
    .order("date", { ascending: true });

  if (eventsError || !insertedEvents || insertedEvents.length === 0) {
    return { error: eventsError?.message ?? "Erro ao criar evento." };
  }

  const firstEventId = insertedEvents[0].id;

  if (!scaleCheck.ok) {
    revalidatePath("/eventos");
    revalidatePath("/admin/eventos");
    return { error: null, eventId: firstEventId };
  }

  let templateName = "Checklist";
  let templateItems: { label: string; position: number }[] = [];
  if (checklistMode === "template" && templateId) {
    const { data: template } = await check.supabase
      .from("checklist_templates")
      .select("name")
      .eq("id", templateId)
      .single();
    templateName = template?.name ?? "Checklist";
    const { data: items } = await check.supabase
      .from("checklist_template_items")
      .select("label, position")
      .eq("template_id", templateId)
      .order("position");
    templateItems = items ?? [];
  }

  for (const ev of insertedEvents) {
    const { data: scale } = await check.supabase
      .from("scales")
      .insert({ event_id: ev.id, name: "Escala", script_url: scriptUrl, created_by: check.userId })
      .select("id")
      .single();
    if (!scale) continue;

    if (roomIds.length > 0) {
      const { error: roomsError } = await check.supabase
        .from("scale_rooms")
        .insert(roomIds.map((room_id) => ({ scale_id: scale.id, room_id })));
      if (roomsError) return { error: roomsError.message };
    }

    if (teamIds.length > 0) {
      const { error: teamsError } = await check.supabase
        .from("scale_teams")
        .insert(teamIds.map((team_id) => ({ scale_id: scale.id, team_id })));
      if (teamsError) return { error: teamsError.message };
    }

    if (hasFile) {
      const path = `${scale.id}/${Date.now()}-${sanitizeFilename(file!.name)}`;
      const { error: uploadError } = await check.supabase.storage
        .from("scale-scripts")
        .upload(path, file!);
      if (!uploadError) {
        await check.supabase.from("scales").update({ script_file_path: path }).eq("id", scale.id);
      }
    }

    if (requestedParticipants.length > 0) {
      const { error: assignmentsError } = await check.supabase.from("scale_assignments").insert(
        requestedParticipants.map((p) => ({
          scale_id: scale.id,
          user_id: p.user_id,
          team_id: profileById.get(p.user_id)?.team_id ?? null,
          room_id: p.room_id,
        }))
      );
      if (assignmentsError) return { error: assignmentsError.message };
    }

    if (checklistMode === "template" && templateId) {
      const { data: scaleChecklist } = await check.supabase
        .from("scale_checklists")
        .insert({ scale_id: scale.id, name: templateName })
        .select("id")
        .single();
      if (scaleChecklist && templateItems.length > 0) {
        await check.supabase.from("scale_checklist_items").insert(
          templateItems.map((i) => ({
            scale_checklist_id: scaleChecklist.id,
            label: i.label,
            position: i.position,
          }))
        );
      }
    } else if (checklistMode === "blank") {
      await check.supabase.from("scale_checklists").insert({ scale_id: scale.id, name: "Checklist" });
    }
  }

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  revalidatePath(`/eventos/${firstEventId}`);
  return { error: null, eventId: firstEventId };
}

// Edição via o mesmo wizard de criação (ver card "Editar evento" — a
// página em admin/eventos/[id]/editar reusa NewEventForm em modo edição).
// Diferente de createEventWithScale: nunca cria mais de 1 evento (sem
// recorrência aqui — editar é sempre a ocorrência única), e reconcilia
// salas/equipes/participantes já existentes em vez de inserir do zero.
// Checklist não é tocada aqui — gerenciada pela tela do evento.
export async function updateEventWithScale(formData: FormData) {
  const check = await requirePermission("eventos", "edit");
  if (!check.ok) return { error: check.error };

  const event_id = formData.get("event_id") as string;
  const event_type_id = formData.get("event_type_id") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const date = formData.get("date") as string;
  const start_time = (formData.get("start_time") as string) || null;
  const end_time = (formData.get("end_time") as string) || null;
  const location = (formData.get("location") as string) || null;

  const { error: eventError } = await check.supabase
    .from("events")
    .update({ event_type_id, title, description, date, start_time, end_time, location })
    .eq("id", event_id);
  if (eventError) return { error: eventError.message };

  const scaleCheck = await requirePermission("escalas", "edit");
  if (!scaleCheck.ok) {
    revalidatePath("/eventos");
    revalidatePath("/admin/eventos");
    revalidatePath(`/eventos/${event_id}`);
    return { error: null, eventId: event_id };
  }

  const { data: scale } = await check.supabase
    .from("scales")
    .select("id")
    .eq("event_id", event_id)
    .maybeSingle();

  if (!scale) {
    revalidatePath("/eventos");
    revalidatePath("/admin/eventos");
    revalidatePath(`/eventos/${event_id}`);
    return { error: null, eventId: event_id };
  }

  const scriptUrl = (formData.get("script_url") as string) || null;
  const file = formData.get("file") as File | null;
  const hasFile = !!file && file.size > 0;
  const roomIds = parseStringArray(formData.get("room_ids"));
  const teamIds = parseStringArray(formData.get("team_ids"));
  const requestedParticipants = parseParticipants(formData.get("participants"));

  const { data: validRooms } = roomIds.length
    ? await check.supabase.from("rooms").select("id").in("id", roomIds)
    : { data: [] };
  if ((validRooms ?? []).length !== roomIds.length) return { error: "Uma das salas selecionadas não existe mais." };

  const { data: validTeams } = teamIds.length
    ? await check.supabase.from("teams").select("id").in("id", teamIds)
    : { data: [] };
  if ((validTeams ?? []).length !== teamIds.length) return { error: "Uma das equipes selecionadas não existe mais." };

  const participantIds = requestedParticipants.map((p) => p.user_id);
  const { data: participantProfiles } = participantIds.length
    ? await check.supabase.from("profiles").select("id, team_id").in("id", participantIds).eq("status", "approved")
    : { data: [] };
  if ((participantProfiles ?? []).length !== participantIds.length) {
    return { error: "Um dos voluntários selecionados não está disponível." };
  }

  const validRoomIds = new Set((validRooms ?? []).map((r) => r.id));
  if (requestedParticipants.some((p) => p.room_id && !validRoomIds.has(p.room_id))) {
    return { error: "Todo voluntário deve ser atribuído somente a uma sala em operação." };
  }
  const profileById = new Map((participantProfiles ?? []).map((p) => [p.id, p]));

  await check.supabase.from("scales").update({ script_url: scriptUrl }).eq("id", scale.id);

  if (hasFile) {
    const path = `${scale.id}/${Date.now()}-${sanitizeFilename(file!.name)}`;
    const { error: uploadError } = await check.supabase.storage.from("scale-scripts").upload(path, file!);
    if (!uploadError) await check.supabase.from("scales").update({ script_file_path: path }).eq("id", scale.id);
  }

  const { data: currentRooms } = await check.supabase
    .from("scale_rooms")
    .select("room_id")
    .eq("scale_id", scale.id);
  const currentRoomIds = new Set((currentRooms ?? []).map((r) => r.room_id));
  const roomsToAdd = roomIds.filter((id) => !currentRoomIds.has(id));
  const roomsToRemove = [...currentRoomIds].filter((id) => !roomIds.includes(id));
  if (roomsToAdd.length) {
    await check.supabase.from("scale_rooms").insert(roomsToAdd.map((room_id) => ({ scale_id: scale.id, room_id })));
  }
  if (roomsToRemove.length) {
    await check.supabase.from("scale_rooms").delete().eq("scale_id", scale.id).in("room_id", roomsToRemove);
  }

  const { data: currentTeams } = await check.supabase
    .from("scale_teams")
    .select("team_id")
    .eq("scale_id", scale.id);
  const currentTeamIds = new Set((currentTeams ?? []).map((t) => t.team_id));
  const teamsToAdd = teamIds.filter((id) => !currentTeamIds.has(id));
  const teamsToRemove = [...currentTeamIds].filter((id) => !teamIds.includes(id));
  if (teamsToAdd.length) {
    await check.supabase.from("scale_teams").insert(teamsToAdd.map((team_id) => ({ scale_id: scale.id, team_id })));
  }
  if (teamsToRemove.length) {
    await check.supabase.from("scale_teams").delete().eq("scale_id", scale.id).in("team_id", teamsToRemove);
  }

  const { data: currentAssignments } = await check.supabase
    .from("scale_assignments")
    .select("id, user_id, room_id")
    .eq("scale_id", scale.id)
    .not("user_id", "is", null);
  const currentByUser = new Map((currentAssignments ?? []).map((a) => [a.user_id as string, a]));
  const requestedByUser = new Map(requestedParticipants.map((p) => [p.user_id, p]));

  const toRemove = (currentAssignments ?? []).filter((a) => !requestedByUser.has(a.user_id as string));
  if (toRemove.length) {
    await check.supabase.from("scale_assignments").delete().in("id", toRemove.map((a) => a.id));
  }

  const toAdd = requestedParticipants.filter((p) => !currentByUser.has(p.user_id));
  if (toAdd.length) {
    const { error: assignmentsError } = await check.supabase.from("scale_assignments").insert(
      toAdd.map((p) => ({
        scale_id: scale.id,
        user_id: p.user_id,
        team_id: profileById.get(p.user_id)?.team_id ?? null,
        room_id: p.room_id,
      }))
    );
    if (assignmentsError) return { error: assignmentsError.message };
  }

  for (const p of requestedParticipants) {
    const current = currentByUser.get(p.user_id);
    if (current && current.room_id !== p.room_id) {
      await check.supabase.from("scale_assignments").update({ room_id: p.room_id }).eq("id", current.id);
    }
  }

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  revalidatePath(`/eventos/${event_id}`);
  return { error: null, eventId: event_id };
}

export async function deleteEvent(formData: FormData) {
  const check = await requirePermission("eventos", "delete");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const { error } = await check.supabase.from("events").delete().eq("id", id);

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  return { error: error?.message ?? null };
}

export async function createScale(formData: FormData) {
  const check = await requirePermission("escalas", "create");
  if (!check.ok) return { error: check.error };

  const event_id = formData.get("event_id") as string;
  const name = formData.get("name") as string;
  const script_url = (formData.get("script_url") as string) || null;

  const { error } = await check.supabase
    .from("scales")
    .insert({ event_id, name, script_url, created_by: check.userId });

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function addAssignment(formData: FormData) {
  const check = await requirePermission("escalas", "create");
  if (!check.ok) return { error: check.error };

  const scale_id = formData.get("scale_id") as string;
  const event_id = formData.get("event_id") as string;
  const user_id = formData.get("user_id") as string;
  const room_id = (formData.get("room_id") as string) || null;
  const role = (formData.get("role") as string) || null;

  const { error } = await check.supabase
    .from("scale_assignments")
    .insert({ scale_id, user_id, room_id, role });

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function addTeamAssignments(formData: FormData) {
  const check = await requirePermission("escalas", "create");
  if (!check.ok) return { error: check.error };

  const scale_id = formData.get("scale_id") as string;
  const event_id = formData.get("event_id") as string;
  const team_id = formData.get("team_id") as string;
  const room_id = (formData.get("room_id") as string) || null;
  const role = (formData.get("role") as string) || null;
  const userIds = formData.getAll("user_ids") as string[];

  if (userIds.length === 0) return { error: "Selecione ao menos um membro." };

  const { error } = await check.supabase.from("scale_assignments").insert(
    userIds.map((user_id) => ({ scale_id, team_id, user_id, room_id, role }))
  );

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function updateAssignment(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const event_id = formData.get("event_id") as string;
  const room_id = (formData.get("room_id") as string) || null;
  const role = (formData.get("role") as string) || null;
  const attendance_status = formData.get("attendance_status") as string;

  const { error } = await check.supabase
    .from("scale_assignments")
    .update({ room_id, role, attendance_status })
    .eq("id", id);

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function deleteAssignment(formData: FormData) {
  const check = await requirePermission("escalas", "delete");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const { error } = await check.supabase.from("scale_assignments").delete().eq("id", id);

  revalidatePath("/eventos");
  return { error: error?.message ?? null };
}

export async function respondToRsvp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const event_id = formData.get("event_id") as string;
  const status = formData.get("status") as string;
  const justification = (formData.get("justification") as string) || null;

  const { error } = await supabase
    .from("event_rsvps")
    .upsert(
      { event_id, user_id: user.id, status, justification },
      { onConflict: "event_id,user_id" }
    );

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function uploadScaleScript(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const scale_id = formData.get("scale_id") as string;
  const event_id = formData.get("event_id") as string;
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const path = `${scale_id}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await check.supabase.storage.from("scale-scripts").upload(path, file);
  if (uploadError) return { error: uploadError.message };

  const { error } = await check.supabase
    .from("scales")
    .update({ script_file_path: path })
    .eq("id", scale_id);

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function getScaleScriptUrl(formData: FormData) {
  const supabase = await createClient();
  const filePath = formData.get("file_path") as string;
  const { data, error } = await supabase.storage.from("scale-scripts").createSignedUrl(filePath, 60);
  return { url: error ? null : data.signedUrl };
}

export async function createScaleChecklistFromTemplate(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const scale_id = formData.get("scale_id") as string;
  const event_id = formData.get("event_id") as string;
  const template_id = formData.get("template_id") as string;

  const { data: template } = await check.supabase
    .from("checklist_templates")
    .select("name")
    .eq("id", template_id)
    .single();

  const { data: items } = await check.supabase
    .from("checklist_template_items")
    .select("label, position")
    .eq("template_id", template_id)
    .order("position");

  const { data: scaleChecklist, error } = await check.supabase
    .from("scale_checklists")
    .insert({ scale_id, name: template?.name ?? "Checklist" })
    .select()
    .single();

  if (!error && scaleChecklist && items && items.length > 0) {
    await check.supabase.from("scale_checklist_items").insert(
      items.map((i) => ({ scale_checklist_id: scaleChecklist.id, label: i.label, position: i.position }))
    );
  }

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function createBlankScaleChecklist(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const scale_id = formData.get("scale_id") as string;
  const event_id = formData.get("event_id") as string;
  const name = (formData.get("name") as string) || "Checklist";

  const { error } = await check.supabase.from("scale_checklists").insert({ scale_id, name });

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function addChecklistItem(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const scale_checklist_id = formData.get("scale_checklist_id") as string;
  const event_id = formData.get("event_id") as string;
  const label = formData.get("label") as string;

  const { error } = await check.supabase
    .from("scale_checklist_items")
    .insert({ scale_checklist_id, label });

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function toggleChecklistItem(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const event_id = formData.get("event_id") as string;
  const checked = formData.get("checked") === "true";

  const { error } = await check.supabase
    .from("scale_checklist_items")
    .update({
      checked,
      checked_by: checked ? check.userId : null,
      checked_at: checked ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath(`/eventos/${event_id}`);
  return { error: error?.message ?? null };
}

export async function deleteChecklistItem(formData: FormData) {
  const check = await requirePermission("escalas", "edit");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const { error } = await check.supabase.from("scale_checklist_items").delete().eq("id", id);

  revalidatePath("/eventos");
  return { error: error?.message ?? null };
}

export async function respondToAssignment(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const justification = (formData.get("justification") as string) || null;
  const substitute_user_id = (formData.get("substitute_user_id") as string) || null;
  const event_id = formData.get("event_id") as string;

  const { error } = await supabase.rpc("respond_to_assignment", {
    p_id: id,
    p_status: status,
    p_justification: justification,
    p_substitute_user_id: substitute_user_id,
  });

  revalidatePath(`/eventos/${event_id}`);
  revalidatePath("/");
  return { error: error?.message ?? null };
}

// Admin/Supervisor/Coordenação cancelando a confirmação/recusa de outro
// voluntário — volta pra 'pending' (ver migration 0028_decline_auto_semeando_tempo.sql).
export async function cancelAssignmentConfirmation(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const event_id = formData.get("event_id") as string;

  const { error } = await supabase.rpc("cancel_assignment_confirmation", { p_id: id });

  revalidatePath(`/eventos/${event_id}`);
  revalidatePath("/");
  return { error: error?.message ?? null };
}
