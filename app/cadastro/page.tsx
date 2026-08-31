import { Sparkles } from "lucide-react";
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, var(--orange-dark) 0%, var(--orange) 55%, var(--orange-light) 100%)",
      }}
    >
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--orange-dark)] to-[color:var(--orange-light)] text-white shadow-lg">
            <Sparkles className="size-7" />
          </span>
          <div>
            <p className="font-serif text-xl font-bold">Start</p>
            <p className="text-xs text-muted-foreground">PIB Campo Comprido</p>
          </div>
        </div>

        <h1 className="mb-4 text-center text-lg font-bold">Criar conta</h1>

        <div className="flex flex-col gap-4">
          {params.error && (
            <Alert variant="destructive">
              <AlertDescription>{params.error}</AlertDescription>
            </Alert>
          )}

          <form action={signup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" name="full_name" type="text" required autoComplete="name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Seu acesso fica pendente até a coordenação aprovar o cadastro.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
