import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateUser } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (currentProfile?.role !== "admin") redirect("/");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, address, role, status, created_at")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <a href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Início
      </a>
      <h1 className="font-serif text-2xl">Usuários</h1>

      {profiles?.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle className="text-base">{p.full_name || "(sem nome)"}</CardTitle>
            <p className="text-sm text-muted-foreground">{p.email}</p>
          </CardHeader>
          <CardContent>
            <form action={updateUser} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <input type="hidden" name="id" value={p.id} />

              <div className="flex flex-1 flex-col gap-1.5 sm:min-w-40">
                <Label>Nome completo</Label>
                <Input name="full_name" type="text" defaultValue={p.full_name ?? ""} />
              </div>

              <div className="flex flex-1 flex-col gap-1.5 sm:min-w-40">
                <Label>Telefone</Label>
                <Input name="phone" type="tel" required defaultValue={p.phone ?? ""} />
              </div>

              <div className="flex flex-1 flex-col gap-1.5 sm:min-w-40">
                <Label>Endereço</Label>
                <Input name="address" type="text" defaultValue={p.address ?? ""} />
              </div>

              <div className="flex flex-1 flex-col gap-1.5 sm:min-w-36">
                <Label>Perfil</Label>
                <Select name="role" defaultValue={p.role}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Voluntário</SelectItem>
                    <SelectItem value="leader">Supervisor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 sm:min-w-32">
                <Label>Status</Label>
                <Select name="status" defaultValue={p.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit">Salvar</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
