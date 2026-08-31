-- Novo cadastro público nasce "pending" (aguardando aprovação), não mais
-- "blocked" direto — mesmo efeito prático (sem acesso), rótulo mais correto
-- agora que existe distinção entre "nunca aprovado" e "aprovado e depois
-- bloqueado".
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
    (case when is_first_user then 'approved' else 'pending' end)::public.user_status
  );

  return new;
end;
$$;
