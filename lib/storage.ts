import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Buckets são privados (nunca público) — toda visualização/download passa
 * por signed URL de curta duração, gerada sob demanda.
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresIn = 60
) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}
