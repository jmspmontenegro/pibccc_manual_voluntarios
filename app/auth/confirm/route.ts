import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdminsOfNewSignup } from "@/app/auth/notify-new-signup";

/**
 * Link do e-mail de confirmação (ver `supabase/email-templates/confirm-signup.html`)
 * aponta pra cá com `token_hash`+`type`. Troca pela sessão só pra validar o
 * token — desloga IMEDIATAMENTE em seguida, porque `status` (pending/approved)
 * só é checado dentro de `login()` (`app/auth/actions.ts`), não no
 * `app/(app)/layout.tsx`. Sem esse signOut, um usuário `pending` ficaria com
 * sessão válida só de ter confirmado o e-mail, antes de qualquer aprovação.
 * Ver FLUXO_CADASTRO.md na raiz do repo.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      if (type === "signup" && data.user) {
        await notifyAdminsOfNewSignup(supabase, data.user.id);
      }
      await supabase.auth.signOut();
      const message = encodeURIComponent(
        "E-mail confirmado com sucesso! Aguarde a aprovação da coordenação do ministério — você será notificado."
      );
      return NextResponse.redirect(`${origin}/login?message=${message}`);
    }
  }

  const message = encodeURIComponent(
    "Não foi possível confirmar seu e-mail. O link pode ter expirado — tente se cadastrar novamente."
  );
  return NextResponse.redirect(`${origin}/login?error=${message}`);
}
