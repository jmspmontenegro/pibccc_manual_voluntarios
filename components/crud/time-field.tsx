"use client";

import { useState } from "react";
import { NativeSelect } from "@/components/crud/native-select";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const HOUR_OPTIONS = [
  { value: "none", label: "Sem horário" },
  ...HOURS.map((h) => ({ value: h, label: `${h}h` })),
];
const MINUTE_OPTIONS = MINUTES.map((m) => ({ value: m, label: m }));

/**
 * Seletor de horário em 24h (00-23h), sem depender do formato AM/PM que o
 * <input type="time"> nativo herda da configuração regional do sistema
 * operacional — não da lang da página, por isso não dava pra forçar via
 * lang="pt-BR". Usa <select> nativo (NativeSelect) pra abrir a interface
 * de escolha do próprio celular, não uma popup custom.
 */
export function TimeField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  const [hour, setHour] = useState(defaultValue ? defaultValue.slice(0, 2) : "");
  const [minute, setMinute] = useState(defaultValue ? defaultValue.slice(3, 5) : "");

  const value = hour ? `${hour}:${minute || "00"}` : "";

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={value} />
      <NativeSelect
        className="w-full"
        value={hour || "none"}
        options={HOUR_OPTIONS}
        onChange={(e) => {
          const h = e.target.value === "none" ? "" : e.target.value;
          setHour(h);
          if (h && !minute) setMinute("00");
        }}
      />
      <NativeSelect
        className="w-20 shrink-0"
        value={minute || "00"}
        options={MINUTE_OPTIONS}
        onChange={(e) => setMinute(e.target.value)}
      />
    </div>
  );
}
