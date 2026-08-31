-- Elenco real de cada equipe (M:N usuário<->equipe) — profiles.team_id
-- continua sendo a "equipe principal" (badge); team_members é quem de fato
-- serve em cada equipe, usado pela Fase B (escalar equipe inteira).
alter table public.teams add column description text;
alter table public.teams add column active boolean not null default true;

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'volunteer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

alter table public.team_members enable row level security;

create policy "team members are readable by authenticated users"
on public.team_members for select to authenticated using (true);

-- Reaproveita o domínio "equipes" já existente (gerenciar elenco é parte de
-- gerenciar a equipe, não um domínio novo).
create policy "team members write requires equipes permission"
on public.team_members for insert to authenticated
with check (public.has_permission('equipes', 'edit'));

create policy "team members update requires equipes permission"
on public.team_members for update to authenticated
using (public.has_permission('equipes', 'edit'))
with check (public.has_permission('equipes', 'edit'));

create policy "team members delete requires equipes permission"
on public.team_members for delete to authenticated
using (public.has_permission('equipes', 'edit'));
