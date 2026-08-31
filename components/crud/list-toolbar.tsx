"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef } from "react";
import { Download, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToExcel, printArea, type ExportRow } from "@/lib/export";

export type SortOption = { value: string; label: string };

/**
 * Barra padrão de qualquer listagem de CRUD do app (ver AGENTS.md → Padrão
 * de CRUD): busca (query param `q`), ordenação (query param `sort`),
 * exportar Excel e imprimir. Busca/ordenação viram parte da URL pra a
 * página (Server Component) refazer a query no banco; exportar/imprimir
 * atuam sobre as linhas já carregadas na tela.
 *
 * `data` já vem achatada (chave = cabeçalho da coluna) e calculada no
 * Server Component da página — funções não podem atravessar a fronteira
 * Server -> Client Component como prop, só dados serializáveis.
 */
export function ListToolbar({
  searchPlaceholder = "Buscar...",
  sortOptions,
  data,
  filename,
}: {
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  data: ExportRow[];
  filename: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", value), 350);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={searchPlaceholder}
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {sortOptions && sortOptions.length > 0 && (
          <Select
            defaultValue={searchParams.get("sort") ?? sortOptions[0].value}
            onValueChange={(value) => setParam("sort", value ?? "")}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => exportToExcel(data, filename)}>
          <Download className="size-4" />
          Excel
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => printArea()}>
          <Printer className="size-4" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}
