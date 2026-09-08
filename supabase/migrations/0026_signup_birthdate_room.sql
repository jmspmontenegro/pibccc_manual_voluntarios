-- Cadastro externo (/cadastro) passa a coletar data de nascimento e sala
-- preferencial também, não só o cadastro interno (edição em /admin/usuarios).
-- Precisa que handle_new_user() grave esses dois campos a partir do
-- raw_user_meta_data enviado por signup(), e que a lista de salas fique
-- legível por usuário anônimo (a página de cadastro roda sem sessão).

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

  insert into public.profiles (id, full_name, email, phone, role, status, birth_date, preferred_room_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    (case when is_first_user then 'admin' else 'volunteer' end)::public.user_role,
    (case when is_first_user then 'approved' else 'pending' end)::public.user_status,
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'preferred_room_id', '')::uuid
  );

  return new;
end;
$$;

create policy "rooms are readable by anon for signup"
on public.rooms for select to anon
using (active);
