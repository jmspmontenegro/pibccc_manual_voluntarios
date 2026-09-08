import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage recusa a key do objeto com "Invalid key" quando o nome
 * do arquivo original tem acento, espaço ou outro caractere fora de um
 * charset restrito — normaliza (remove acento), troca o resto por "-" e
 * preserva a extensão. Sempre usar isso ao montar `${id}/${timestamp}-${nome}`.
 */
export function sanitizeFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";

  const safeBase = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  const safeExt = ext
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.]+/g, "");

  return `${safeBase || "arquivo"}${safeExt}`;
}

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
