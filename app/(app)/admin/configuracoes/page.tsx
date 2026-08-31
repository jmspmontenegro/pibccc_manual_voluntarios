import { redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateSettings } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const LOGOS = [
  { label: "Logo roxa (PNG)", href: "/img/LOGO START ROXA PNG.png" },
  { label: "Logo branca (PNG)", href: "/img/LOGO START BRANCA PNG.png" },
  { label: "Logo roxa (SVG)", href: "/img/LOGO START ROXA.svg" },
];

export default async function ConfiguracoesPage() {
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

  const { data: settings } = await supabase
    .from("app_settings")
    .select("primary_color")
    .single();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <a href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Início
      </a>
      <h1 className="font-serif text-2xl">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cor principal</CardTitle>
          <CardDescription>Aplica em toda a interface do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="flex items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="primary_color">Cor da aplicação</Label>
              <input
                id="primary_color"
                name="primary_color"
                type="color"
                defaultValue={settings?.primary_color ?? "#8060FF"}
                className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
              />
            </div>
            <Button type="submit">Salvar cor</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logomarca do ministério</CardTitle>
          <CardDescription>Logo usada atualmente no manual do voluntário.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {LOGOS.map((logo) => (
            <Button key={logo.href} variant="outline" render={<a href={logo.href} download />}>
              <Download className="size-4" />
              {logo.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
