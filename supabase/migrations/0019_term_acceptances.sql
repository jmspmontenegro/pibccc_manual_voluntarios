-- Registro de aceite do Termo de Voluntariado. Um usuário pode aceitar
-- várias versões ao longo do tempo (texto do termo pode mudar).
create table public.term_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  term_version text not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, term_version)
);

alter table public.term_acceptances enable row level security;

create policy "term acceptances readable by self or usuarios permission"
on public.term_acceptances for select to authenticated
using (user_id = auth.uid() or public.has_permission('usuarios', 'view'));

create policy "term acceptances insertable by self"
on public.term_acceptances for insert to authenticated
with check (user_id = auth.uid());
