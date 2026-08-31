-- Checklists: templates reutilizáveis (domínio próprio, config, admin +
-- coordenação) e a instância real por escala (reaproveita o domínio
-- "escalas" — marcar/adicionar item é parte de gerenciar a escala).
create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates (id) on delete cascade,
  label text not null,
  position int not null default 0
);

create table public.scale_checklists (
  id uuid primary key default gen_random_uuid(),
  scale_id uuid not null unique references public.scales (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.scale_checklist_items (
  id uuid primary key default gen_random_uuid(),
  scale_checklist_id uuid not null references public.scale_checklists (id) on delete cascade,
  label text not null,
  position int not null default 0,
  checked boolean not null default false,
  checked_by uuid references public.profiles (id),
  checked_at timestamptz
);

alter table public.checklist_templates enable row level security;
alter table public.checklist_template_items enable row level security;
alter table public.scale_checklists enable row level security;
alter table public.scale_checklist_items enable row level security;

create policy "checklist templates are readable by authenticated users"
on public.checklist_templates for select to authenticated using (true);
create policy "checklist template items are readable by authenticated users"
on public.checklist_template_items for select to authenticated using (true);
create policy "scale checklists are readable by authenticated users"
on public.scale_checklists for select to authenticated using (true);
create policy "scale checklist items are readable by authenticated users"
on public.scale_checklist_items for select to authenticated using (true);

create policy "checklist templates write requires checklists permission"
on public.checklist_templates for all to authenticated
using (public.has_permission('checklists', 'edit'))
with check (public.has_permission('checklists', 'edit'));

create policy "checklist template items write requires checklists permission"
on public.checklist_template_items for all to authenticated
using (public.has_permission('checklists', 'edit'))
with check (public.has_permission('checklists', 'edit'));

create policy "scale checklists write requires escalas permission"
on public.scale_checklists for all to authenticated
using (public.has_permission('escalas', 'edit'))
with check (public.has_permission('escalas', 'edit'));

create policy "scale checklist items write requires escalas permission"
on public.scale_checklist_items for all to authenticated
using (public.has_permission('escalas', 'edit'))
with check (public.has_permission('escalas', 'edit'));

insert into public.permission_domains (key, label) values ('checklists', 'Checklists');

insert into public.permission_actions (domain_key, action_key, label) values
  ('checklists', 'view', 'Visualizar'),
  ('checklists', 'edit', 'Editar');

insert into public.role_permissions (role, domain_key, action_key)
select r, domain_key, action_key
from public.permission_actions, unnest(array['admin', 'coordinator']::public.user_role[]) as r
where domain_key = 'checklists';
