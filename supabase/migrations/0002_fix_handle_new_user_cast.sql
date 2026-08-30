-- Fix: the CASE expression in handle_new_user() resolved to text, but the
-- profiles.role column is the user_role enum. Postgres does not implicitly
-- cast a CASE result to a custom enum the way it does a bare literal, so
-- every signup failed with "column role is of type user_role but expression
-- is of type text". Recreate the function with an explicit cast.
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
