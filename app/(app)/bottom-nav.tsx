"use client";

import { BookOpen, CalendarDays, Menu, User, Clock, Users, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-between bg-primary px-6 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
      <NavLink href="/manual" icon={BookOpen} label="Manual" />

      <div className="flex flex-1 justify-center">
        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="Menu"
                className="-translate-y-4 flex size-14 items-center justify-center rounded-full border-4 border-primary bg-primary-foreground text-primary shadow-lg"
              />
            }
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pb-4">
              <MenuLink href="/banco-de-horas" icon={Clock} label="Banco de Horas" />
              {isAdmin && <MenuLink href="/admin/usuarios" icon={Users} label="Usuários" />}
              {isAdmin && (
                <MenuLink href="/admin/configuracoes" icon={Settings} label="Configurações" />
              )}
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        <NavLink href="/calendario" icon={CalendarDays} label="Calendário" />
        <NavLink href="/perfil" icon={User} label="Perfil" />
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-1 px-1 py-1 text-xs font-medium text-primary-foreground/85"
    >
      <Icon className="size-5" />
      {label}
    </a>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Clock;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
    >
      <Icon className="size-4" />
      {label}
    </a>
  );
}
