"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  if (!can(perms, "usuarios", action)) {
    return { ok: false as const, error: "Sem permissão para esta ação." };
  }
  return { ok: true as const, supabase };
}

export async function updateUser(formData: FormData) {
  const check = await requirePermission("edit");
  if (!check.ok) return { error: check.error };

  const id = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;
  const team_id = (formData.get("team_id") as string) || null;

  // RLS no banco também barra role/status pra quem não for admin (trigger
  // protect_role_status_trigger) — checagem aqui é só pra feedback melhor.
  const { error } = await check.supabase
    .from("profiles")
    .update({ full_name, phone, address, role, status, team_id })
    .eq("id", id);

  revalidatePath("/admin/usuarios");
  return { error: error?.message ?? null };
}

export async function createUser(formData: FormData) {
  const check = await requirePermission("create");
  if (!check.ok) return { error: check.error };

  const email = formData.get("email") as string;
  const full_name = formData.get("full_name") as string;
  const phone = (formData.get("phone") as string) || "";
  const password = formData.get("password") as string;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone },
  });

  // Usuário adicionado diretamente por um admin já nasce aprovado — o
  // bloqueio automático de handle_new_user() é só pro autocadastro público.
  if (!error && data.user) {
    await admin.from("profiles").update({ status: "active" }).eq("id", data.user.id);
  }

  revalidatePath("/admin/usuarios");
  return { error: error?.message ?? null };
}

export async function resetPassword(formData: FormData) {
  const check = await requirePermission("edit");
  if (!check.ok) return { error: check.error, password: null };

  const id = formData.get("id") as string;
  const password = Math.random().toString(36).slice(-10) + "Aa1!";

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password });

  return { error: error?.message ?? null, password: error ? null : password };
}
