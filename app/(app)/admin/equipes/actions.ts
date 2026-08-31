"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTeam(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const supervisor_id = (formData.get("supervisor_id") as string) || null;
  const color = formData.get("color") as string;

  const { error } = await supabase.from("teams").insert({ name, supervisor_id, color });

  revalidatePath("/admin/equipes");
  return { error: error?.message ?? null };
}

export async function updateTeam(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const supervisor_id = (formData.get("supervisor_id") as string) || null;
  const color = formData.get("color") as string;

  const { error } = await supabase
    .from("teams")
    .update({ name, supervisor_id, color })
    .eq("id", id);

  revalidatePath("/admin/equipes");
  return { error: error?.message ?? null };
}

export async function deleteTeam(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("teams").delete().eq("id", id);

  revalidatePath("/admin/equipes");
  return { error: error?.message ?? null };
}
