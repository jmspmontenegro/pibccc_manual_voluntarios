-- Salas que efetivamente estarão em operação em uma escala. Isso é
-- intencionalmente separado de scale_assignments: uma sala pode estar
-- preparada para o culto mesmo antes de alguém ser atribuído a ela.
create table public.scale_rooms (
  scale_id uuid not null references public.scales (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (scale_id, room_id)
);

-- A equipe responsável também é informação própria da operação. Ela não é
-- inferida das atribuições, porque um evento pode ter uma equipe de apoio
-- mesmo quando só alguns de seus membros foram escalados.
create table public.scale_teams (
  scale_id uuid not null references public.scales (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (scale_id, team_id)
);

alter table public.scale_rooms enable row level security;
alter table public.scale_teams enable row level security;

create policy "scale rooms are readable by authenticated users"
on public.scale_rooms for select to authenticated using (true);

create policy "scale teams are readable by authenticated users"
on public.scale_teams for select to authenticated using (true);

create policy "scale rooms insert requires escalas permission"
on public.scale_rooms for insert to authenticated
with check (public.has_permission('escalas', 'create'));

create policy "scale teams insert requires escalas permission"
on public.scale_teams for insert to authenticated
with check (public.has_permission('escalas', 'create'));

create policy "scale rooms update requires escalas permission"
on public.scale_rooms for update to authenticated
using (public.has_permission('escalas', 'edit'))
with check (public.has_permission('escalas', 'edit'));

create policy "scale teams update requires escalas permission"
on public.scale_teams for update to authenticated
using (public.has_permission('escalas', 'edit'))
with check (public.has_permission('escalas', 'edit'));

create policy "scale rooms delete requires escalas permission"
on public.scale_rooms for delete to authenticated
using (public.has_permission('escalas', 'delete'));

create policy "scale teams delete requires escalas permission"
on public.scale_teams for delete to authenticated
using (public.has_permission('escalas', 'delete'));
