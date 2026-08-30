import { login } from "@/app/auth/actions";
import "@/app/auth.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-main">
      <h1>Entrar</h1>
      {params.message && <p className="auth-message">{params.message}</p>}
      {params.error && <p className="auth-error">{params.error}</p>}
      <form className="auth-form" action={login}>
        <label>
          E-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Senha
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button type="submit">Entrar</button>
      </form>
      <p className="auth-link">
        Ainda não tem conta? <a href="/cadastro">Criar conta</a>
      </p>
    </main>
  );
}
