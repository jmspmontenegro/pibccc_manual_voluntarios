import {
  Bell,
  Sparkles,
  CalendarDays,
  PartyPopper,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Rainbow,
  Pencil,
  Church,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const ROLE_LABEL = {
  admin: "Administrador",
  coordinator: "Coordenação",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

const QUICK_ACCESS = [
  { icon: CalendarDays, label: "Escala Semana", color: "#2563AB", bg: "#EBF3FC", href: null },
  { icon: PartyPopper, label: "Próx. Evento", color: "#DB2777", bg: "#FCE7F3", href: "/eventos" },
  { icon: Users, label: "Equipe Hoje", color: "#16A34A", bg: "#EEF8F2", href: "/pessoas" },
  { icon: ClipboardCheck, label: "Check-in", color: "#D97706", bg: "#FFFBEB", href: null },
];

const AVISOS = [
  {
    icon: AlertTriangle,
    title: "Sua próxima escala",
    subtitle: "Dom, 7 de Set · Culto 10h — Liderança",
    tone: "primary",
    badge: "7 dias",
  },
  {
    icon: Rainbow,
    title: "Festa Junina Kids!",
    subtitle: "Sábado, 14h — venha fantasiado!",
    tone: "yellow",
  },
  {
    icon: Pencil,
    title: "Novo material didático",
    subtitle: "Série Heróis da Fé — baixe agora",
    tone: "violet",
  },
  {
    icon: Church,
    title: "Reunião de líderes",
    subtitle: "Quinta-feira às 19h30 — obrigatório",
    tone: "blue",
  },
];

const TONE_CLASS = {
  primary: "bg-primary text-primary-foreground",
  yellow: "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B]/30",
  violet: "bg-secondary text-secondary-foreground border border-border",
  blue: "bg-[#EBF3FC] text-[#2563AB] border border-[#93C5FD]/40",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "volunteer";

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--orange-dark)] to-[color:var(--orange-light)] text-white shadow">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-serif text-base font-bold leading-tight">Start</p>
            <p className="text-xs leading-tight text-muted-foreground">PIB Campo Comprido</p>
          </div>
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Bell className="size-4" />
        </span>
      </div>

      <div className="glass-dark relative overflow-hidden rounded-2xl p-6 text-white shadow-lg">
        <Sparkles className="absolute right-4 top-4 size-8 text-white/30" />
        <p className="font-semibold">Bem-vindo de volta! 👋</p>
        <p className="mt-1 font-serif text-2xl font-bold">{profile?.full_name || user.email}</p>
        <p className="mt-1 text-sm text-white/85">Domingo · 10h e 17h</p>
        <span className="mt-3 inline-block w-fit rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold">
          {ROLE_LABEL[role]}
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-bold">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACCESS.map((item) => {
            const card = (
              <div
                className="glass flex flex-col items-start gap-2 rounded-2xl p-4"
                style={{ opacity: item.href ? 1 : 0.85 }}
              >
                <span
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  <item.icon className="size-5" />
                </span>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            );
            return item.href ? (
              <a key={item.label} href={item.href}>
                {card}
              </a>
            ) : (
              <div key={item.label}>{card}</div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">Avisos</h2>
          <span className="text-sm font-semibold text-primary">Ver todos</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {AVISOS.map((aviso) => (
            <div
              key={aviso.title}
              className={`flex items-center gap-3 rounded-2xl p-4 ${TONE_CLASS[aviso.tone]}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/25">
                <aviso.icon className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold">{aviso.title}</p>
                <p className="text-xs opacity-85">{aviso.subtitle}</p>
              </div>
              {aviso.badge && (
                <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-bold">
                  {aviso.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
