import { Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TERM_TEXT } from "@/lib/terms";
import { acceptTerm } from "./terms-actions";
import { DeclineTermButton } from "./decline-term-button";

export function TermGate() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, var(--orange-dark) 0%, var(--orange) 55%, var(--orange-light) 100%)",
      }}
    >
      <div className="glass flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--orange-dark)] to-[color:var(--orange-light)] text-white shadow-lg">
            <Sparkles className="size-6" />
          </span>
          <h1 className="font-serif text-lg font-bold">Termo de Voluntariado</h1>
          <p className="text-xs text-muted-foreground">
            Leia com atenção antes de continuar
          </p>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-xl border bg-white/70 p-3 text-sm text-foreground whitespace-pre-line">
          {TERM_TEXT}
        </div>

        <p className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FFFBEB] px-3 py-2 text-center text-xs font-semibold italic text-[#92400E]">
          <Eye className="size-3.5 shrink-0" />
          Deus tá vendo você aceitar sem ler…
        </p>

        <div className="flex flex-col gap-2">
          <form action={acceptTerm}>
            <Button type="submit" className="w-full">
              Li e concordo
            </Button>
          </form>
          <DeclineTermButton />
        </div>
      </div>
    </main>
  );
}
