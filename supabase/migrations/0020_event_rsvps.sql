-- RSVP de eventos sem escala (ex.: reunião) — independente da confirmação
-- de escala (scale_assignments.confirmation_status). Auto-serviço: cada um
-- só mexe na própria linha, sem precisar de convite prévio nem de
-- has_permission (não tem coluna sensível pra proteger, diferente de
-- scale_assignments/respond_to_assignment).
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  justification text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

create policy "event rsvps are readable by authenticated users"
on public.event_rsvps for select to authenticated using (true);

create policy "event rsvps insertable by self"
on public.event_rsvps for insert to authenticated
with check (user_id = auth.uid());

create policy "event rsvps updatable by self"
on public.event_rsvps for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
