"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { VIEW_AS_COOKIE, SIMULATABLE_ROLES } from "@/lib/view-as";

// Confere o role no banco (não confia em nada vindo do form) — só admin de
// verdade pode ligar a simulação, mesmo que alguém forje a chamada.
export async function setViewAsRole(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return;

  const role = formData.get("role") as string;
  const store = await cookies();
  if ((SIMULATABLE_ROLES as readonly string[]).includes(role)) {
    store.set(VIEW_AS_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/" });
  }

  revalidatePath("/", "layout");
}

export async function clearViewAsRole() {
  const store = await cookies();
  store.delete(VIEW_AS_COOKIE);
  revalidatePath("/", "layout");
}
