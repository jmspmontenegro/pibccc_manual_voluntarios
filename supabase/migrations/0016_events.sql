-- Eventos do ministério ("o que, quando e onde acontece"). Não confundir
-- com escala (quem serve) — ver 0017_scales.sql.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid not null references public.event_types (id),
  title text not null,
  description text,
  date date not null,
  start_time time,
  end_time time,
  location text,
  status text not null default 'planned',
  recurrence_group_id uuid,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events are readable by authenticated users"
on public.events for select to authenticated using (true);

create policy "events insert requires eventos permission"
on public.events for insert to authenticated
with check (public.has_permission('eventos', 'create'));

create policy "events update requires eventos permission"
on public.events for update to authenticated
using (public.has_permission('eventos', 'edit'))
with check (public.has_permission('eventos', 'edit'));

create policy "events delete requires eventos permission"
on public.events for delete to authenticated
using (public.has_permission('eventos', 'delete'));

insert into public.permission_domains (key, label) values ('eventos', 'Eventos');

insert into public.permission_actions (domain_key, action_key, label) values
  ('eventos', 'view', 'Visualizar'),
  ('eventos', 'create', 'Criar'),
  ('eventos', 'edit', 'Editar'),
  ('eventos', 'delete', 'Excluir');

-- Regra de negócio explícita: só admin e coordenação, desde já (mesmo
-- padrão de tipos_evento).
insert into public.role_permissions (role, domain_key, action_key)
select r, domain_key, action_key
from public.permission_actions, unnest(array['admin', 'coordinator']::public.user_role[]) as r
where domain_key = 'eventos';
