import { ArrowLeft, FileCheck2, FileX2, FileClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadForm } from "./document-upload-form";
import { DownloadButton } from "./download-button";
import { DeleteButton } from "@/components/crud/delete-button";
import { deleteDocument } from "./actions";

function computeStatus(validUntil: string | null) {
  if (!validUntil) return { label: "Nunca enviado", variant: "outline" as const, icon: FileX2 };
  const isValid = validUntil >= new Date().toISOString().slice(0, 10);
  return isValid
    ? {
        label: `Válido até ${new Date(validUntil + "T00:00:00").toLocaleDateString("pt-BR")}`,
        variant: "default" as const,
        icon: FileCheck2,
      }
    : { label: "Vencido — reenviar", variant: "destructive" as const, icon: FileClock };
}

export default async function DocumentosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const perms = await getRolePermissions(supabase, currentProfile!.role);
  const canViewAll = can(perms, "documentos", "view");
  const canDelete = can(perms, "documentos", "delete");

  const { data: myDocs } = await supabase
    .from("volunteer_documents")
    .select("file_path, submitted_at, valid_until")
    .eq("user_id", user!.id)
    .order("submitted_at", { ascending: false })
    .limit(1);

  const myLatest = myDocs?.[0];
  const myStatus = computeStatus(myLatest?.valid_until ?? null);

  let rows: {
    id: string;
    full_name: string | null;
    email: string;
    doc?: { id: string; file_path: string };
    status: ReturnType<typeof computeStatus>;
  }[] = [];

  if (canViewAll) {
    const { data: allDocs } = await supabase
      .from("volunteer_documents")
      .select("id, user_id, file_path, submitted_at, valid_until")
      .order("submitted_at", { ascending: false });

    const { data: volunteers } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("status", "approved")
      .order("full_name");

    const latestByUser = new Map<string, { id: string; file_path: string; valid_until: string }>();
    for (const d of allDocs ?? []) {
      if (!latestByUser.has(d.user_id)) latestByUser.set(d.user_id, d);
    }

    rows = (volunteers ?? []).map((v) => {
      const doc = latestByUser.get(v.id);
      return { ...v, doc, status: computeStatus(doc?.valid_until ?? null) };
    });
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <a href="/mais" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="size-4" />
        Voltar
      </a>
      <h1 className="font-serif text-2xl">Certidão de Antecedentes</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <myStatus.icon className="size-5" />
            Sua situação
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Badge variant={myStatus.variant} className="w-fit">
            {myStatus.label}
          </Badge>
          <p className="text-xs text-muted-foreground">
            A certidão precisa ser renovada a cada 6 meses.
          </p>
          <DocumentUploadForm label={myLatest ? "Reenviar" : "Enviar certidão"} />
        </CardContent>
      </Card>

      {canViewAll && (
        <>
          <h2 className="font-serif text-lg font-bold">Todos os voluntários</h2>
          <div className="flex flex-col gap-3">
            {rows.map((r) => {
              const initial = (r.full_name || r.email).charAt(0).toUpperCase();
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11">
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold leading-tight">{r.full_name || r.email}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {r.doc && <DownloadButton filePath={r.doc.file_path} />}
                      {r.doc && canDelete && (
                        <DeleteButton
                          id={r.doc.id}
                          action={deleteDocument}
                          confirmMessage={`Excluir a certidão de ${r.full_name || r.email}?`}
                        />
                      )}
                    </div>
                  </div>
                  <Badge variant={r.status.variant} className="w-fit">
                    {r.status.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
