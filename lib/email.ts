import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `Start (PIB Campo Comprido) <notificacoes@${process.env.RESEND_EMAIL_DOMAIN}>`;

/**
 * SDK do Resend não lança exceção — sempre retorna `{ data, error }` (ver
 * skill `resend` instalada em `.agents/skills/resend`). `idempotencyKey`
 * evita reenvio duplicado se a Server Action rodar de novo por retry.
 *
 * Falha de envio nunca deve quebrar o fluxo principal (aprovação/cadastro
 * continuam válidos mesmo se o e-mail falhar) — por isso só loga o erro,
 * nunca propaga pra quem chamou.
 */
async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}) {
  const { error } = await resend.emails.send(
    { from: FROM, to: [to], subject, html },
    { idempotencyKey }
  );
  if (error) console.error("Resend: falha ao enviar e-mail:", error.message);
}

function wrapBrand(bodyHtml: string) {
  return `
<div style="background-color:#FFFBF5; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:420px; margin:0 auto; background-color:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(90,63,214,0.12);">
    <div style="background-color:#8060FF; padding:24px; text-align:center;">
      <p style="margin:0; font-size:18px; font-weight:bold; color:#FFFFFF; font-family:Georgia, 'Times New Roman', serif;">Start</p>
      <p style="margin:2px 0 0; font-size:11px; color:rgba(255,255,255,0.85);">PIB Campo Comprido</p>
    </div>
    <div style="padding:24px;">${bodyHtml}</div>
  </div>
</div>`;
}

function buttonHtml(href: string, label: string) {
  return `<div style="text-align:center; margin:20px 0;"><a href="${href}" style="display:inline-block; background-color:#8060FF; color:#FFFFFF; text-decoration:none; font-weight:bold; font-size:14px; padding:12px 28px; border-radius:999px;">${label}</a></div>`;
}

export async function sendNewSignupNotification({
  to,
  volunteerName,
  volunteerEmail,
  volunteerPhone,
  approveUrl,
}: {
  to: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  approveUrl: string;
}) {
  const html = wrapBrand(`
    <h1 style="margin:0 0 12px; font-size:16px; color:#1A1A1A;">Novo cadastro aguardando aprovação</h1>
    <p style="margin:0 0 4px; font-size:14px; color:#4A4A4A;"><strong>${volunteerName}</strong></p>
    <p style="margin:0 0 4px; font-size:13px; color:#8A8A8A;">${volunteerEmail}</p>
    <p style="margin:0 0 16px; font-size:13px; color:#8A8A8A;">${volunteerPhone || "(sem telefone)"}</p>
    ${buttonHtml(approveUrl, "Ver cadastro")}
  `);

  await sendEmail({
    to,
    subject: `Novo cadastro pendente: ${volunteerName}`,
    html,
    idempotencyKey: `new-signup-notify/${volunteerEmail}/${to}`,
  });
}

export async function sendApprovalEmail({
  to,
  volunteerName,
  loginUrl,
}: {
  to: string;
  volunteerName: string;
  loginUrl: string;
}) {
  const html = wrapBrand(`
    <h1 style="margin:0 0 12px; font-size:16px; color:#1A1A1A;">Seu acesso foi liberado!</h1>
    <p style="margin:0 0 16px; font-size:14px; color:#4A4A4A;">
      Olá, ${volunteerName}! Seu cadastro como voluntário foi aprovado pela coordenação —
      já dá pra fazer login e acessar o app.
    </p>
    ${buttonHtml(loginUrl, "Fazer login")}
  `);

  await sendEmail({
    to,
    subject: "Seu acesso foi liberado!",
    html,
    idempotencyKey: `approval-email/${to}`,
  });
}
