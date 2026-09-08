import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/**
 * Select nativo do sistema operacional (roda de iOS, lista do Android),
 * estilizado pra bater com o visual do <Select> do shadcn/base-ui — usado
 * onde a interface nativa de escolha é preferível à popup custom em cima
 * do conteúdo (pedido explícito no formulário de evento). `<option>` não
 * sofre do bug de "precisa de items pra mostrar o rótulo certo" do
 * Select do base-ui, porque o navegador já cuida disso sozinho.
 */
export function NativeSelect({
  options,
  placeholder,
  className,
  value,
  defaultValue,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
  placeholder?: string;
}) {
  const isEmpty = value === undefined && defaultValue === undefined;

  return (
    <div className="relative w-full">
      <select
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-input bg-transparent py-2 pr-8 pl-2.5 text-sm outline-none transition-colors select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50",
          isEmpty && "text-muted-foreground",
          className
        )}
        value={value}
        defaultValue={value === undefined ? (defaultValue ?? "") : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
