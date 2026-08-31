"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function togglePermission(formData: FormData) {
  const supabase = await createClient();

  const role = formData.get("role") as string;
  const domain_key = formData.get("domain_key") as string;
  const action_key = formData.get("action_key") as string;
  const granted = formData.get("granted") === "true";

  // RLS ("only admins manage role permissions") também barra quem não é
  // admin — essa tela em si é hard-gated pra admin (ver page.tsx), de
  // propósito: a matriz de permissões não deve ser editável nem pela
  // própria matriz que ela controla.
  if (granted) {
    await supabase.from("role_permissions").insert({ role, domain_key, action_key });
  } else {
    await supabase
      .from("role_permissions")
      .delete()
      .eq("role", role)
      .eq("domain_key", domain_key)
      .eq("action_key", action_key);
  }

  revalidatePath("/admin/configuracoes/permissoes");
}
