"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

/**
 * Seletor de horário em 24h (00-23h), sem depender do formato AM/PM que o
 * <input type="time"> nativo herda da configuração regional do sistema
 * operacional — não da lang da página, por isso não dava pra forçar via
 * lang="pt-BR".
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
      <Select
        value={hour || "none"}
        onValueChange={(v) => {
          const h = v === "none" ? "" : (v as string);
          setHour(h);
          if (h && !minute) setMinute("00");
        }}
        items={{ none: "Sem horário", ...Object.fromEntries(HOURS.map((h) => [h, `${h}h`])) }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Hora" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem horário</SelectItem>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}h
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={minute || "00"}
        onValueChange={(v) => setMinute(v as string)}
        items={Object.fromEntries(MINUTES.map((m) => [m, m]))}
      >
        <SelectTrigger className="w-20 shrink-0">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
