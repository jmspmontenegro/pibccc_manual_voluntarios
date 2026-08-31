"use client";

import { usePathname } from "next/navigation";
import { Home, CalendarDays, PartyPopper, Users, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/agenda", icon: CalendarDays, label: "Agenda" },
  { href: "/eventos", icon: PartyPopper, label: "Eventos" },
  { href: "/pessoas", icon: Users, label: "Pessoas" },
  { href: "/mais", icon: MoreHorizontal, label: "Mais" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <a
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold"
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-colors",
                active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
              )}
            >
              <tab.icon className="size-5" />
            </span>
            <span className={active ? "text-primary" : "text-muted-foreground"}>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
