-- Cadastro de equipes do ministério.
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  supervisor_id uuid references public.profiles (id) on delete set null,
  color text not null default '#8060FF',
  created_at timestamptz not null default now()
);

alter table public.profiles add column team_id uuid references public.teams (id) on delete set null;

alter table public.teams enable row level security;

-- Precisa aparecer como badge em qualquer lista (usuários, semeando tempo,
-- pessoas), então leitura é liberada a qualquer autenticado.
create policy "teams are readable by authenticated users"
on public.teams for select to authenticated using (true);

create policy "teams write requires equipes permission"
on public.teams for insert to authenticated
with check (public.has_permission('equipes', 'create'));

create policy "teams update requires equipes permission"
on public.teams for update to authenticated
using (public.has_permission('equipes', 'edit'))
with check (public.has_permission('equipes', 'edit'));

create policy "teams delete requires equipes permission"
on public.teams for delete to authenticated
using (public.has_permission('equipes', 'delete'));

insert into public.permission_domains (key, label) values ('equipes', 'Equipes');

insert into public.permission_actions (domain_key, action_key, label) values
  ('equipes', 'view', 'Visualizar'),
  ('equipes', 'create', 'Criar'),
  ('equipes', 'edit', 'Editar'),
  ('equipes', 'delete', 'Excluir');

insert into public.role_permissions (role, domain_key, action_key)
select 'admin', domain_key, action_key from public.permission_actions where domain_key = 'equipes';
