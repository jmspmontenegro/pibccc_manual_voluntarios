import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client com service role — pula RLS inteiramente. Só usar dentro de Server
 * Actions que já checaram permissão (has_permission) do usuário chamador
 * ANTES de chamar isso; aqui não existe rede de segurança do banco (ver
 * AGENTS.md — RLS é a camada autoritativa, exceto quando o service role é
 * usado de propósito, como criação de usuário via supabase.auth.admin).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
