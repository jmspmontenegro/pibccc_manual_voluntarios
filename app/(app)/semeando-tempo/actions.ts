"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";

async function requirePermission(action: "create" | "edit" | "delete") {
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
  if (!can(perms, "semeando_tempo", action)) {
    return { ok: false as const, error: "Sem permissão para esta ação." };
  }
  return { ok: true as const, supabase, userId: user.id };
}

export async function addEntry(formData: FormData) {
  const check = await requirePermission("create");
  if (!check.ok) return { error: check.error };

  const user_id = formData.get("user_id") as string;
  const entered_at = (formData.get("entered_at") as string) || undefined;
  const note = (formData.get("note") as string) || null;

  const { error } = await check.supabase.from("semeando_tempo_entries").insert({
    user_id,
    entered_at,
    note,
    created_by: check.userId,
  });

  revalidatePath("/semeando-tempo");
  return { error: error?.message ?? null };
}

export async function updateEntry(formData: FormData) {
  const check = await requirePermission("edit");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const entered_at = formData.get("entered_at") as string;
  const note = (formData.get("note") as string) || null;

  const { error } = await check.supabase
    .from("semeando_tempo_entries")
    .update({ entered_at, note })
    .eq("id", id);

  revalidatePath("/semeando-tempo");
  return { error: error?.message ?? null };
}

export async function deleteEntry(formData: FormData) {
  const check = await requirePermission("delete");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const { error } = await check.supabase.from("semeando_tempo_entries").delete().eq("id", id);

  revalidatePath("/semeando-tempo");
  return { error: error?.message ?? null };
}
