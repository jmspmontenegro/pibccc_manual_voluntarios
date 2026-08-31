import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BancoDeHorasPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <a href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Início
      </a>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Banco de Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Em construção — em breve dá pra registrar e acompanhar horas por aqui.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
