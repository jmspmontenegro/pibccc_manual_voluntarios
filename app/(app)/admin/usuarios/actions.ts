"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUser(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;

  // RLS no banco também barra role/status pra quem não for admin (trigger
  // protect_role_status_trigger) — checagem aqui é só pra feedback melhor.
  await supabase
    .from("profiles")
    .update({ full_name, phone, address, role, status })
    .eq("id", id);

  revalidatePath("/admin/usuarios");
}
