import { signup } from "@/app/auth/actions";
import "@/app/auth.css";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-main">
      <h1>Criar conta</h1>
      {params.error && <p className="auth-error">{params.error}</p>}
      <form className="auth-form" action={signup}>
        <label>
          Nome completo
          <input name="full_name" type="text" required autoComplete="name" />
        </label>
        <label>
          E-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Telefone
          <input name="phone" type="tel" required autoComplete="tel" placeholder="(00) 00000-0000" />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <button type="submit">Criar conta</button>
      </form>
      <p className="auth-link">
        Já tem conta? <a href="/login">Entrar</a>
      </p>
    </main>
  );
}
