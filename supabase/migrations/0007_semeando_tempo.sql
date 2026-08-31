-- "Semeando Tempo": banco de voluntários disponíveis pra cobrir escalas.
-- Cada linha é uma entrada (uma vez que a pessoa entrou no banco); a tela
-- lista agrupado por pessoa, contando entradas nos últimos 12 meses.
create table public.semeando_tempo_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entered_at date not null default current_date,
  note text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.semeando_tempo_entries enable row level security;

-- Admin/Coordenação/Supervisão (quem tiver a permissão de domínio) veem tudo.
create policy "semeando tempo readable with domain permission"
on public.semeando_tempo_entries for select to authenticated
using (public.has_permission('semeando_tempo', 'view'));

-- Voluntário sempre pode ver as próprias entradas, mesmo sem a permissão de
-- domínio (ele só enxerga a si mesmo, nunca a lista completa).
create policy "semeando tempo readable by self"
on public.semeando_tempo_entries for select to authenticated
using (user_id = auth.uid());

create policy "semeando tempo insert requires permission"
on public.semeando_tempo_entries for insert to authenticated
with check (public.has_permission('semeando_tempo', 'create'));

create policy "semeando tempo update requires permission"
on public.semeando_tempo_entries for update to authenticated
using (public.has_permission('semeando_tempo', 'edit'))
with check (public.has_permission('semeando_tempo', 'edit'));

create policy "semeando tempo delete requires permission"
on public.semeando_tempo_entries for delete to authenticated
using (public.has_permission('semeando_tempo', 'delete'));

insert into public.permission_domains (key, label) values ('semeando_tempo', 'Semeando Tempo');

insert into public.permission_actions (domain_key, action_key, label) values
  ('semeando_tempo', 'view', 'Visualizar'),
  ('semeando_tempo', 'create', 'Criar'),
  ('semeando_tempo', 'edit', 'Editar'),
  ('semeando_tempo', 'delete', 'Excluir');

insert into public.role_permissions (role, domain_key, action_key)
select 'admin', domain_key, action_key from public.permission_actions where domain_key = 'semeando_tempo';
