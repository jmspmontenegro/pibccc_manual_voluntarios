-- Aprovação manual de cadastro: todo novo voluntário nasce bloqueado
-- (status = inactive) e só um admin pode aprovar (mudar pra active).
-- O primeiro usuário do sistema continua nascendo admin/active (bootstrap).
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

  insert into public.profiles (id, full_name, email, phone, role, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    (case when is_first_user then 'admin' else 'volunteer' end)::public.user_role,
    (case when is_first_user then 'active' else 'inactive' end)::public.user_status
  );

  return new;
end;
$$;
