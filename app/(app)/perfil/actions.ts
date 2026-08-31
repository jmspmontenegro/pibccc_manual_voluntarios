"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOwnProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  // RLS ("users can update their own profile") já restringe isso à própria
  // linha, e o trigger protect_role_status_trigger impede troca de
  // role/status por quem não é admin mesmo que alguém tente forjar o form.
  await supabase.from("profiles").update({ full_name, phone, address }).eq("id", user.id);

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
}
