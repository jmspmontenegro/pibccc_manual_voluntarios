"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * `<input type="date">` mostra o formato nativo do navegador/SO (às vezes
 * mm/dd/yyyy mesmo com `lang="pt-BR"` na página) e ignora `placeholder`.
 * Esse campo troca pra texto mascarado dd/mm/aaaa — sempre igual,
 * independente de locale — e carrega o valor real em ISO (yyyy-mm-dd) num
 * input escondido com o mesmo `name`, pra nenhuma Server Action/coluna do
 * banco precisar mudar.
 */

function isoToDisplay(iso?: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  return `${y}-${m}-${d}`;
}

function maskDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("/");
}

type BaseProps = {
  id?: string;
  name: string;
  required?: boolean;
  className?: string;
};

type UncontrolledProps = BaseProps & {
  defaultValue?: string | null;
  value?: never;
  onChangeIso?: never;
};

type ControlledProps = BaseProps & {
  value: string;
  onChangeIso: (iso: string) => void;
  defaultValue?: never;
};

export function DateField(props: UncontrolledProps | ControlledProps) {
  const { id, name, required, className } = props;
  const isControlled = "onChangeIso" in props && props.onChangeIso !== undefined;

  const [display, setDisplay] = useState(() =>
    isoToDisplay(isControlled ? props.value : props.defaultValue)
  );

  useEffect(() => {
    if (isControlled) setDisplay(isoToDisplay(props.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled ? props.value : null]);

  const iso = displayToIso(display);

  function handleChange(raw: string) {
    const masked = maskDisplay(raw);
    setDisplay(masked);
    if (isControlled) props.onChangeIso(displayToIso(masked));
  }

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        pattern="\d{2}/\d{2}/\d{4}"
        title="Use o formato dd/mm/aaaa"
        className={className}
        value={display}
        onChange={(e) => handleChange(e.target.value)}
        required={required}
      />
      <input type="hidden" name={name} value={iso} />
    </>
  );
}
