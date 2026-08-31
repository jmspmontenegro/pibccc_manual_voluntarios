"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { getSignedUrl } from "@/lib/storage";

const BUCKET = "volunteer-documents";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) return { error: uploadError.message };

  const submitted_at = new Date();
  const valid_until = new Date(submitted_at);
  valid_until.setMonth(valid_until.getMonth() + 6);

  const { error } = await supabase.from("volunteer_documents").insert({
    user_id: user.id,
    file_path: path,
    submitted_at: submitted_at.toISOString().slice(0, 10),
    valid_until: valid_until.toISOString().slice(0, 10),
  });

  revalidatePath("/documentos");
  revalidatePath("/");
  return { error: error?.message ?? null };
}

export async function getDocumentUrl(formData: FormData) {
  const supabase = await createClient();
  const filePath = formData.get("file_path") as string;
  const url = await getSignedUrl(supabase, BUCKET, filePath);
  return { url };
}

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const perms = await getRolePermissions(supabase, profile!.role);
  if (!can(perms, "documentos", "delete")) return { error: "Sem permissão para esta ação." };

  const id = formData.get("id") as string;
  const { data: doc } = await supabase
    .from("volunteer_documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (doc) await supabase.storage.from(BUCKET).remove([doc.file_path]);
  const { error } = await supabase.from("volunteer_documents").delete().eq("id", id);

  revalidatePath("/documentos");
  return { error: error?.message ?? null };
}
