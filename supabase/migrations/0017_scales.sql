-- Escala representa "quem vai servir" num evento. Um evento pode não ter
-- escala (ex.: reunião de líderes); pode ter mais de uma.
create table public.scales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  script_url text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scales enable row level security;

create policy "scales are readable by authenticated users"
on public.scales for select to authenticated using (true);

create policy "scales insert requires escalas permission"
on public.scales for insert to authenticated
with check (public.has_permission('escalas', 'create'));

create policy "scales update requires escalas permission"
on public.scales for update to authenticated
using (public.has_permission('escalas', 'edit'))
with check (public.has_permission('escalas', 'edit'));

create policy "scales delete requires escalas permission"
on public.scales for delete to authenticated
using (public.has_permission('escalas', 'delete'));

insert into public.permission_domains (key, label) values ('escalas', 'Escalas');

insert into public.permission_actions (domain_key, action_key, label) values
  ('escalas', 'view', 'Visualizar'),
  ('escalas', 'create', 'Criar'),
  ('escalas', 'edit', 'Editar'),
  ('escalas', 'delete', 'Excluir');

-- Regra de negócio explícita (mesma do Semeando Tempo): supervisão monta
-- escala no dia a dia, não é algo que fica só com admin/coordenação.
insert into public.role_permissions (role, domain_key, action_key)
select r, domain_key, action_key
from public.permission_actions, unnest(array['admin', 'coordinator', 'leader']::public.user_role[]) as r
where domain_key = 'escalas';
