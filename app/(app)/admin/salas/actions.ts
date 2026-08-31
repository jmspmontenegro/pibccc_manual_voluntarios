"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRoom(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const location = (formData.get("location") as string) || null;

  const { error } = await supabase.from("rooms").insert({ name, description, location });

  revalidatePath("/admin/salas");
  return { error: error?.message ?? null };
}

export async function updateRoom(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const location = (formData.get("location") as string) || null;

  const { error } = await supabase
    .from("rooms")
    .update({ name, description, location })
    .eq("id", id);

  revalidatePath("/admin/salas");
  return { error: error?.message ?? null };
}

export async function deleteRoom(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("rooms").delete().eq("id", id);

  revalidatePath("/admin/salas");
  return { error: error?.message ?? null };
}
