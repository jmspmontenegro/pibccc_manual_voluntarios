-- Permite o voluntário recusar o Termo de Voluntariado e se auto-bloquear.
-- protect_role_status() (0003_profile_fields_and_settings.sql) reverte
-- qualquer troca de status que não venha de um admin de verdade — regra
-- deliberada contra escalonamento de privilégio. Auto-bloqueio é o oposto
-- disso (só reduz o próprio acesso), então abrimos uma exceção estreita:
-- o próprio usuário pode mudar seu status pra 'blocked' (nunca pra
-- approved/pending, nunca a role), o resto continua bloqueado como antes.
create or replace function public.protect_role_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role public.user_role;
  self_decline boolean;
begin
  select role into acting_role from public.profiles where id = auth.uid();

  self_decline := auth.uid() = old.id
    and new.role = old.role
    and new.status = 'blocked'
    and old.status is distinct from 'blocked';

  if acting_role is distinct from 'admin' and not self_decline then
    new.role := old.role;
    new.status := old.status;
  end if;

  return new;
end;
$$;

-- security definer pra rodar como owner (bypassa a policy de update de
-- profiles, que exige has_permission('usuarios','edit') — o voluntário
-- comum não tem). auth.uid() = id garante que só bloqueia a si mesmo.
create or replace function public.decline_term()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set status = 'blocked' where id = auth.uid();
end;
$$;
