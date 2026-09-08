import type { SupabaseClient } from "@supabase/supabase-js";
import { sendNewSignupNotification } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Roda com a sessão do próprio voluntário recém-confirmado (chamado antes
 * do signOut em app/auth/confirm/route.ts) — RLS de `profiles` permite
 * SELECT amplo pra autenticado (só a escrita é restrita por permissão),
 * então dá pra buscar os e-mails de admin/coordenação nessa mesma sessão
 * sem precisar de service role. Falha de e-mail nunca deve travar o fluxo
 * de confirmação — ver `lib/email.ts`.
 */
export async function notifyAdminsOfNewSignup(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", userId)
    .single();
  if (!profile) return;

  const { data: staff } = await supabase
    .from("profiles")
    .select("email")
    .in("role", ["admin", "coordinator"]);

  const approveUrl = `${getSiteUrl()}/admin/usuarios?highlight=${userId}`;

  await Promise.all(
    (staff ?? []).map((s) =>
      sendNewSignupNotification({
        to: s.email,
        volunteerName: profile.full_name || profile.email,
        volunteerEmail: profile.email,
        volunteerPhone: profile.phone,
        approveUrl,
      })
    )
  );
}
