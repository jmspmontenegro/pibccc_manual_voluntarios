"use client";

import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type Person = { id: string; full_name: string | null; email: string };

/**
 * Buscador de pessoa em modal, pra listas grandes onde um <select> comum
 * fica ruim de usar (ver AGENTS.md → Padrão de CRUD). Guarda a escolha num
 * input hidden com o `name` passado, pra funcionar dentro de qualquer form
 * existente sem mudar a Server Action.
 */
export function PersonPicker({
  name,
  people,
  defaultPerson,
  placeholder = "Buscar por nome...",
  triggerLabel = "Buscar voluntário",
}: {
  name: string;
  people: Person[];
  defaultPerson?: Person | null;
  placeholder?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Person | null>(defaultPerson ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) => (p.full_name ?? "").toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  }, [query, people]);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={selected?.id ?? ""} required />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button type="button" variant="outline" className="justify-start">
              <Search className="size-4" />
              {selected ? selected.full_name || selected.email : triggerLabel}
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar voluntário</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-8"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex max-h-72 flex-col overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelected(p);
                  setOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted"
              >
                <UserRound className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{p.full_name || "(sem nome)"}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum voluntário encontrado.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
