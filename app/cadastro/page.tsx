import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Criar conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Entrar
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
