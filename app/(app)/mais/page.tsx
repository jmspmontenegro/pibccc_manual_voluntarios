import {
  Settings,
  BookOpen,
  ClipboardList,
  Trophy,
  MessageSquare,
  FolderOpen,
  Clock,
  Users,
  Shield,
  LogOut,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRolePermissions, can } from "@/lib/permissions";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordenação",
  leader: "Supervisor",
  volunteer: "Voluntário",
};

function MoreLink({
  href,
  icon: Icon,
  iconBg,
  title,
  subtitle,
  disabled,
}: {
  href?: string;
  icon: typeof Settings;
  iconBg: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`glass flex items-center gap-3 rounded-2xl p-4 ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="size-5 text-white" />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {!disabled && <ChevronRight className="size-4 text-muted-foreground" />}
    </div>
  );

  if (disabled) return content;
  return <a href={href}>{content}</a>;
}

export default async function MaisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user!.id)
    .single();

  const perms = await getRolePermissions(supabase, profile!.role);
  const isAdmin = profile!.role === "admin";
  const initial = (profile?.full_name || profile?.email || "?").charAt(0).toUpperCase();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-2xl">Mais Opções</h1>
        <p className="text-sm text-muted-foreground">Ferramentas e recursos</p>
      </div>

      <a href="/perfil" className="glass-dark flex items-center gap-3 rounded-2xl p-4 text-white">
        <Avatar className="size-12 border-2 border-white/40">
          <AvatarFallback className="bg-white/20 text-white">{initial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold">{profile?.full_name || profile?.email}</p>
          <p className="text-xs text-white/80">
            {ROLE_LABEL[profile?.role ?? ""] ?? profile?.role} · PIB Campo Comprido
          </p>
        </div>
        <Pencil className="size-4 text-white/80" />
      </a>

      <div className="flex flex-col gap-3">
        <MoreLink
          href="/semeando-tempo"
          icon={Clock}
          iconBg="#8060FF"
          title="Semeando Tempo"
          subtitle="Voluntários de prontidão pra cobrir escalas"
        />
        <MoreLink
          href="/manual"
          icon={BookOpen}
          iconBg="#A98CFF"
          title="Manual do Líder"
          subtitle="Guia completo para líderes Kids"
        />
        <MoreLink
          icon={ClipboardList}
          iconBg="#22C55E"
          title="Escala de Serviço"
          subtitle="Escalas semanais e mensais"
          disabled
        />
        <MoreLink
          icon={Trophy}
          iconBg="#F59E0B"
          title="Relatórios"
          subtitle="Presença, crescimento e métricas"
          disabled
        />
        <MoreLink
          icon={MessageSquare}
          iconBg="#EC4899"
          title="Comunicados"
          subtitle="Avisos e recados da liderança"
          disabled
        />
        <MoreLink
          icon={FolderOpen}
          iconBg="#14B8A6"
          title="Materiais"
          subtitle="Lições, músicas e downloads"
          disabled
        />

        {can(perms, "usuarios", "view") && (
          <MoreLink
            href="/admin/usuarios"
            icon={Users}
            iconBg="#5A3FD6"
            title="Usuários"
            subtitle="Aprovar, editar e bloquear acessos"
          />
        )}
        {can(perms, "equipes", "view") && (
          <MoreLink
            href="/admin/equipes"
            icon={Users}
            iconBg="#2563AB"
            title="Equipes"
            subtitle="Cadastro de equipes do ministério"
          />
        )}
        {can(perms, "configuracoes", "view") && (
          <MoreLink
            href="/admin/configuracoes"
            icon={Settings}
            iconBg="#64748B"
            title="Configurações"
            subtitle="Notificações, conta, aparência"
          />
        )}
        {isAdmin && (
          <MoreLink
            href="/admin/configuracoes/permissoes"
            icon={Shield}
            iconBg="#1E1A16"
            title="Permissões"
            subtitle="O que cada perfil pode fazer"
          />
        )}
      </div>

      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full justify-start gap-3 text-destructive">
          <LogOut className="size-4" />
          Sair
        </Button>
      </form>
    </main>
  );
}
