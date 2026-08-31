"use client";

import { usePathname } from "next/navigation";
import { Home, CalendarDays, Church, BookOpen, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/agenda", icon: CalendarDays, label: "Agenda" },
  { href: "/eventos", icon: Church, label: "Cultos" },
  { href: "/manual", icon: BookOpen, label: "Manual" },
  { href: "/mais", icon: MoreHorizontal, label: "Mais" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around bg-primary px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-8px_rgba(90,63,214,0.55)]">
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
                active ? "bg-white text-primary shadow-sm" : "text-white/70"
              )}
            >
              <tab.icon className="size-5" />
            </span>
            <span className={active ? "text-white" : "text-white/70"}>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
