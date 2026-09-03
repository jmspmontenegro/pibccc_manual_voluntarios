"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, CalendarDays, Church, BookOpen, MoreHorizontal, Loader2 } from "lucide-react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) setPendingHref(null);
  }, [isPending, pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around bg-primary px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-8px_rgba(90,63,214,0.55)]">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const loading = isPending && pendingHref === tab.href;

        return (
          <a
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            onClick={(e) => {
              if (active) return;
              e.preventDefault();
              setPendingHref(tab.href);
              startTransition(() => router.push(tab.href));
            }}
            className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold"
          >
            <span
              className={cn(
                "relative flex size-9 items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-90",
                active ? "bg-white text-primary shadow-sm" : "text-white/70"
              )}
            >
              {loading && (
                <span className="absolute inset-0 rounded-full bg-white/50 animate-ping" />
              )}
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <tab.icon className="size-5" />
                )}
              </span>
            </span>
            <span className={active ? "text-white" : "text-white/70"}>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
