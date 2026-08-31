-- Cadastro de tipos de evento (Culto, Culto Especial, Reunião, ...) —
-- tabela parametrizável, não enum, pra caber num CRUD (pedido explícito do
-- usuário). Acesso restrito a admin/coordenação desde o seed.
create table public.event_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.event_types enable row level security;

create policy "event types are readable by authenticated users"
on public.event_types for select to authenticated using (true);

create policy "event types write requires tipos_evento permission"
on public.event_types for insert to authenticated
with check (public.has_permission('tipos_evento', 'create'));

create policy "event types update requires tipos_evento permission"
on public.event_types for update to authenticated
using (public.has_permission('tipos_evento', 'edit'))
with check (public.has_permission('tipos_evento', 'edit'));

create policy "event types delete requires tipos_evento permission"
on public.event_types for delete to authenticated
using (public.has_permission('tipos_evento', 'delete'));

insert into public.permission_domains (key, label) values ('tipos_evento', 'Tipos de Evento');

insert into public.permission_actions (domain_key, action_key, label) values
  ('tipos_evento', 'view', 'Visualizar'),
  ('tipos_evento', 'create', 'Criar'),
  ('tipos_evento', 'edit', 'Editar'),
  ('tipos_evento', 'delete', 'Excluir');

-- Regra de negócio explícita: só admin e coordenação, desde já (não fica
-- "fechado por padrão, configurável depois" como os outros domínios).
insert into public.role_permissions (role, domain_key, action_key)
select r, domain_key, action_key
from public.permission_actions, unnest(array['admin', 'coordinator']::public.user_role[]) as r
where domain_key = 'tipos_evento';
