-- Atribuição de serviço dentro de uma escala. team_id e/ou user_id
-- (pelo menos um precisa estar preenchido) — ver AGENTS.md/project-app.md
-- pra raciocínio completo (evento != escala != atribuição).
create table public.scale_assignments (
  id uuid primary key default gen_random_uuid(),
  scale_id uuid not null references public.scales (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  user_id uuid references public.profiles (id) on delete cascade,
  room_id uuid references public.rooms (id) on delete set null,
  role text,
  confirmation_status text not null default 'pending'
    check (confirmation_status in ('pending', 'confirmed', 'declined')),
  justification text,
  substitute_user_id uuid references public.profiles (id) on delete set null,
  attendance_status text not null default 'not_marked'
    check (attendance_status in ('not_marked', 'present', 'absent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scale_assignments_team_or_user check (team_id is not null or user_id is not null)
);

alter table public.scale_assignments enable row level security;

create policy "scale assignments are readable by authenticated users"
on public.scale_assignments for select to authenticated using (true);

create policy "scale assignments insert requires escalas permission"
on public.scale_assignments for insert to authenticated
with check (public.has_permission('escalas', 'create'));

create policy "scale assignments update requires escalas permission"
on public.scale_assignments for update to authenticated
using (public.has_permission('escalas', 'edit'))
with check (public.has_permission('escalas', 'edit'));

create policy "scale assignments delete requires escalas permission"
on public.scale_assignments for delete to authenticated
using (public.has_permission('escalas', 'delete'));

-- Exceção controlada: o próprio voluntário confirma/recusa a própria
-- atribuição sem precisar de has_permission('escalas','edit') (que também
-- deixaria ele editar sala/atribuição de qualquer um). A função checa a
-- dona da linha e só toca as 3 colunas de confirmação.
create function public.respond_to_assignment(
  p_id uuid,
  p_status text,
  p_justification text default null,
  p_substitute_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('confirmed', 'declined') then
    raise exception 'status inválido: %', p_status;
  end if;

  update public.scale_assignments
  set
    confirmation_status = p_status,
    justification = p_justification,
    substitute_user_id = p_substitute_user_id,
    updated_at = now()
  where id = p_id
    and user_id = auth.uid();

  if not found then
    raise exception 'atribuição não encontrada ou não pertence ao usuário';
  end if;
end;
$$;
