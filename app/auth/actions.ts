"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyAdminsOfNewSignup } from "@/app/auth/notify-new-signup";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (profile?.status !== "approved") {
    await supabase.auth.signOut();
    const message =
      profile?.status === "blocked"
        ? "Seu acesso foi bloqueado. Fale com a coordenação."
        : "Seu cadastro ainda está em análise. Aguarde a aprovação da coordenação.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  // Link de e-mail (ex.: notificação de novo cadastro pra admin/coordenação)
  // pode mandar quem não está logado pro /login com `?redirect=`. Só aceita
  // caminho interno começando com "/" (nunca "//" — protocol-relative URL
  // aponta pra fora) pra não virar open redirect.
  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    redirect(redirectTo);
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const birthDate = formData.get("birth_date") as string;
  const preferredRoomId = formData.get("preferred_room_id") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        birth_date: birthDate,
        preferred_room_id: preferredRoomId,
      },
    },
  });

  if (error) {
    redirect(`/cadastro?error=${encodeURIComponent(error.message)}`);
  }

  // Com "Confirm email" ligado no Supabase Dashboard (ver AGENTS.md), signUp()
  // não cria sessão ainda — só depois do usuário clicar no link do e-mail
  // (ver app/auth/confirm/route.ts). Se por algum motivo o toggle estiver
  // desligado (ex.: ambiente de teste), data.session já vem preenchido e
  // pulamos direto pra mensagem de "aguardando aprovação".
  if (!data.session) {
    redirect(
      "/login?message=" +
        encodeURIComponent(
          "Cadastro solicitado! Confira seu e-mail e clique no link de confirmação antes de fazer login."
        )
    );
  }

  // Confirm email desligado (ambiente de teste) — não tem etapa de
  // confirmação pra disparar a notificação, então manda direto aqui.
  if (data.user) {
    await notifyAdminsOfNewSignup(supabase, data.user.id);
  }

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Cadastro enviado! Aguarde a aprovação da coordenação do ministério para acessar."
      )
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
