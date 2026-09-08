-- Fluxo de aprovação (ver FLUXO_CADASTRO.md na raiz do repo): Coordenação
-- também precisa poder aprovar cadastro pendente, não só Administrador —
-- mas coordinator NÃO tem 'usuarios:edit' na matriz dinâmica hoje (só
-- admin, conferido em role_permissions) e não é desejável abrir a edição
-- completa de perfil só pra isso.
--
-- Solução: função estreita (mesmo padrão de respond_to_assignment/
-- decline_term) que só aprova (pending -> approved), nada mais — e uma
-- exceção igualmente estreita no trigger de proteção de role/status, que
-- roda incondicionalmente na tabela independente de RLS/RPC.

create or replace function public.protect_role_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role public.user_role;
  self_decline boolean;
  coordinator_approval boolean;
begin
  select role into acting_role from public.profiles where id = auth.uid();

  self_decline := auth.uid() = old.id
    and new.role = old.role
    and new.status = 'blocked'
    and old.status is distinct from 'blocked';

  coordinator_approval := acting_role = 'coordinator'
    and new.role = old.role
    and old.status = 'pending'
    and new.status = 'approved';

  if acting_role is distinct from 'admin' and not self_decline and not coordinator_approval then
    new.role := old.role;
    new.status := old.status;
  end if;

  return new;
end;
$$;

create or replace function public.approve_pending_user(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_role public.user_role;
begin
  select role into acting_role from public.profiles where id = auth.uid();

  if acting_role not in ('admin', 'coordinator') then
    raise exception 'Sem permissão para aprovar cadastros.';
  end if;

  update public.profiles set status = 'approved' where id = target_id and status = 'pending';
end;
$$;
