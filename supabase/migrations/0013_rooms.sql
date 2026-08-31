-- Cadastro de salas do ministério + campos novos de profiles pedidos
-- (sala preferencial, data de nascimento).
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles add column preferred_room_id uuid references public.rooms (id) on delete set null;
alter table public.profiles add column birth_date date;

alter table public.rooms enable row level security;

create policy "rooms are readable by authenticated users"
on public.rooms for select to authenticated using (true);

create policy "rooms write requires salas permission"
on public.rooms for insert to authenticated
with check (public.has_permission('salas', 'create'));

create policy "rooms update requires salas permission"
on public.rooms for update to authenticated
using (public.has_permission('salas', 'edit'))
with check (public.has_permission('salas', 'edit'));

create policy "rooms delete requires salas permission"
on public.rooms for delete to authenticated
using (public.has_permission('salas', 'delete'));

insert into public.permission_domains (key, label) values ('salas', 'Salas');

insert into public.permission_actions (domain_key, action_key, label) values
  ('salas', 'view', 'Visualizar'),
  ('salas', 'create', 'Criar'),
  ('salas', 'edit', 'Editar'),
  ('salas', 'delete', 'Excluir');

insert into public.role_permissions (role, domain_key, action_key)
select 'admin', domain_key, action_key from public.permission_actions where domain_key = 'salas';
