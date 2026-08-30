-- Profiles table: extends auth.users with app-level fields and access role.
create type public.user_role as enum ('admin', 'leader', 'volunteer');
create type public.user_status as enum ('active', 'inactive');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  role public.user_role not null default 'volunteer',
  status public.user_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any authenticated user can read all profiles (needed for event rosters, admin lists, etc).
create policy "profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

-- Users can update their own profile, but not their own role/status (handled below).
create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins can update any profile (role, status, etc).
create policy "admins can update any profile"
on public.profiles for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Automatically create a profile row whenever a new auth user signs up.
-- The very first user ever created becomes admin (bootstrap); everyone
-- after that starts as a volunteer and is promoted manually by an admin.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    (case when is_first_user then 'admin' else 'volunteer' end)::public.user_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
