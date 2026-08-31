import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Entrar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {params.message && (
            <Alert>
              <AlertDescription>{params.message}</AlertDescription>
            </Alert>
          )}
          {params.error && (
            <Alert variant="destructive">
              <AlertDescription>{params.error}</AlertDescription>
            </Alert>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <a href="/cadastro" className="font-medium text-primary underline-offset-4 hover:underline">
              Criar conta
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
