"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createEventType(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const active = formData.get("active") === "true";

  const { error } = await supabase.from("event_types").insert({ name, description, active });

  revalidatePath("/admin/tipos-evento");
  return { error: error?.message ?? null };
}

export async function updateEventType(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const active = formData.get("active") === "true";

  const { error } = await supabase
    .from("event_types")
    .update({ name, description, active })
    .eq("id", id);

  revalidatePath("/admin/tipos-evento");
  return { error: error?.message ?? null };
}

export async function deleteEventType(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("event_types").delete().eq("id", id);

  revalidatePath("/admin/tipos-evento");
  return { error: error?.message ?? null };
}
