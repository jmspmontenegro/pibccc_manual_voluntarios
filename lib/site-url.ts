/**
 * URL canônica do app pra montar links absolutos em e-mail (não tem
 * domínio próprio configurado ainda — `VERCEL_PROJECT_PRODUCTION_URL` é
 * injetada automaticamente pela Vercel em toda produção, sem precisar
 * estar no .env.local). Defina `NEXT_PUBLIC_SITE_URL` se/quando o projeto
 * ganhar um domínio próprio.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:9010";
}
