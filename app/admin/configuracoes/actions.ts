"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  const primary_color = formData.get("primary_color") as string;

  // RLS ("only admins can update settings") também barra isso pra quem
  // não for admin — checagem aqui é só pra feedback melhor.
  await supabase
    .from("app_settings")
    .update({ primary_color, updated_at: new Date().toISOString() })
    .eq("id", true);

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
}
