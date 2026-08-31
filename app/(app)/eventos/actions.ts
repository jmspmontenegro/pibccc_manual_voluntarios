"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";

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

export async function createEvent(formData: FormData) {
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

  const count = recurs ? weeks : 1;
  const recurrence_group_id = recurs && weeks > 1 ? crypto.randomUUID() : null;

  const rows = Array.from({ length: count }, (_, i) => ({
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

  const { error } = await check.supabase.from("events").insert(rows);

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  return { error: error?.message ?? null };
}

export async function updateEvent(formData: FormData) {
  const check = await requirePermission("eventos", "edit");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const event_type_id = formData.get("event_type_id") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const date = formData.get("date") as string;
  const start_time = (formData.get("start_time") as string) || null;
  const end_time = (formData.get("end_time") as string) || null;
  const location = (formData.get("location") as string) || null;

  const { error } = await check.supabase
    .from("events")
    .update({ event_type_id, title, description, date, start_time, end_time, location })
    .eq("id", id);

  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  return { error: error?.message ?? null };
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

  const path = `${scale_id}/${Date.now()}-${file.name}`;
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
