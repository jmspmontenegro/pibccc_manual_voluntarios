import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { updateOwnProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, address, role")
    .eq("id", user!.id)
    .single();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <a href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Início
      </a>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Meu perfil</CardTitle>
          <Badge variant="secondary">{ROLE_LABEL[profile?.role ?? "volunteer"]}</Badge>
        </CardHeader>
        <CardContent>
          <form action={updateOwnProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" name="full_name" type="text" defaultValue={profile?.full_name ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={profile?.email ?? ""} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" type="tel" required defaultValue={profile?.phone ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" type="text" defaultValue={profile?.address ?? ""} />
            </div>
            <Button type="submit">Salvar</Button>
          </form>
        </CardContent>
      </Card>

      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full">
          Sair
        </Button>
      </form>
    </main>
  );
}
