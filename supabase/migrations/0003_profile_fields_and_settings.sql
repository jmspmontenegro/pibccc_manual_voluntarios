-- New optional/required profile fields.
alter table public.profiles add column address text;

-- Phone becomes required going forward (collected at signup). Backfill any
-- existing null phones (e.g. the bootstrap admin created before this field
-- existed) with an empty string so the NOT NULL constraint can be applied.
update public.profiles set phone = '' where phone is null;
alter table public.profiles alter column phone set not null;
alter table public.profiles alter column phone set default '';

-- Update the new-user trigger to also collect phone from signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    (case when is_first_user then 'admin' else 'volunteer' end)::public.user_role
  );

  return new;
end;
$$;

-- Security: the existing "users can update their own profile" policy is
-- row-level, not column-level, so without this guard a self-edit request
-- could also smuggle in a role/status change. Silently keep the old
-- role/status unless the person making the change is an admin.
create function public.protect_role_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role public.user_role;
begin
  select role into acting_role from public.profiles where id = auth.uid();

  if acting_role is distinct from 'admin' then
    new.role := old.role;
    new.status := old.status;
  end if;

  return new;
end;
$$;

create trigger protect_role_status_trigger
before update on public.profiles
for each row execute function public.protect_role_status();

-- Site-wide settings (singleton row), managed by admins.
create table public.app_settings (
  id boolean primary key default true,
  primary_color text not null default '#8060FF',
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id)
);

insert into public.app_settings (id) values (true);

alter table public.app_settings enable row level security;

create policy "settings are readable by authenticated users"
on public.app_settings for select
to authenticated
using (true);

create policy "only admins can update settings"
on public.app_settings for update
to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
