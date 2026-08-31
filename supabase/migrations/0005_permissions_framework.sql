-- RBAC dinâmico: perfil x domínio x ação, configurável pelo admin em tempo de
-- execução (sem precisar de migration nova pra mudar QUEM pode fazer O QUE).
-- RLS continua sendo a camada autoritativa (ver AGENTS.md) — has_permission()
-- é só uma função auxiliar usada DENTRO das policies de cada domínio, não um
-- substituto pra RLS.

create table public.permission_domains (
  key text primary key,
  label text not null
);

create table public.permission_actions (
  domain_key text not null references public.permission_domains (key) on delete cascade,
  action_key text not null,
  label text not null,
  primary key (domain_key, action_key)
);

create table public.role_permissions (
  role public.user_role not null,
  domain_key text not null,
  action_key text not null,
  primary key (role, domain_key, action_key),
  foreign key (domain_key, action_key) references public.permission_actions (domain_key, action_key) on delete cascade
);

alter table public.permission_domains enable row level security;
alter table public.permission_actions enable row level security;
alter table public.role_permissions enable row level security;

-- Qualquer autenticado pode ler (a tela de configuração de perfis precisa
-- listar domínios/ações, e a UI de cada tela consulta role_permissions pra
-- decidir o que mostrar).
create policy "permission tables are readable by authenticated users"
on public.permission_domains for select to authenticated using (true);

create policy "permission actions are readable by authenticated users"
on public.permission_actions for select to authenticated using (true);

create policy "role permissions are readable by authenticated users"
on public.role_permissions for select to authenticated using (true);

-- Só admin edita a matriz de permissões.
create policy "only admins manage role permissions"
on public.role_permissions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "only admins manage permission domains"
on public.permission_domains for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "only admins manage permission actions"
on public.permission_actions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Função usada pelas policies de cada domínio: has_permission('equipes', 'edit').
create function public.has_permission(p_domain text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_permissions rp
    join public.profiles p on p.role = rp.role
    where p.id = auth.uid()
      and rp.domain_key = p_domain
      and rp.action_key = p_action
  );
$$;

-- Seed: domínios já existentes no app (usuários, configurações). Domínios
-- futuros (equipes, semeando_tempo, ...) são seedados na própria migration
-- que os cria — convenção documentada no AGENTS.md: toda migration de
-- domínio novo já dá permissão total ao admin.
insert into public.permission_domains (key, label) values
  ('usuarios', 'Usuários'),
  ('configuracoes', 'Configurações');

insert into public.permission_actions (domain_key, action_key, label) values
  ('usuarios', 'view', 'Visualizar'),
  ('usuarios', 'create', 'Criar'),
  ('usuarios', 'edit', 'Editar'),
  ('usuarios', 'delete', 'Excluir'),
  ('configuracoes', 'view', 'Visualizar'),
  ('configuracoes', 'edit', 'Editar');

insert into public.role_permissions (role, domain_key, action_key)
select 'admin', domain_key, action_key from public.permission_actions;
