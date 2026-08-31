"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";

async function requirePermission() {
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
  if (!can(perms, "checklists", "edit")) {
    return { ok: false as const, error: "Sem permissão para esta ação." };
  }
  return { ok: true as const, supabase, userId: user.id };
}

export async function createTemplate(formData: FormData) {
  const check = await requirePermission();
  if (!check.ok) return { error: check.error };

  const name = formData.get("name") as string;
  const labels = (formData.getAll("items") as string[]).filter((l) => l.trim());

  const { data: template, error } = await check.supabase
    .from("checklist_templates")
    .insert({ name, created_by: check.userId })
    .select()
    .single();

  if (!error && template && labels.length > 0) {
    await check.supabase.from("checklist_template_items").insert(
      labels.map((label, position) => ({ template_id: template.id, label, position }))
    );
  }

  revalidatePath("/admin/checklists");
  return { error: error?.message ?? null };
}

export async function updateTemplate(formData: FormData) {
  const check = await requirePermission();
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const labels = (formData.getAll("items") as string[]).filter((l) => l.trim());

  const { error } = await check.supabase.from("checklist_templates").update({ name }).eq("id", id);

  await check.supabase.from("checklist_template_items").delete().eq("template_id", id);
  if (labels.length > 0) {
    await check.supabase.from("checklist_template_items").insert(
      labels.map((label, position) => ({ template_id: id, label, position }))
    );
  }

  revalidatePath("/admin/checklists");
  return { error: error?.message ?? null };
}

export async function deleteTemplate(formData: FormData) {
  const check = await requirePermission();
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const { error } = await check.supabase.from("checklist_templates").delete().eq("id", id);

  revalidatePath("/admin/checklists");
  return { error: error?.message ?? null };
}
