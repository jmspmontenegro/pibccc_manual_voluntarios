-- "Culto" é tipo de evento nativo da plataforma (a aba "Cultos" da nav
-- filtra eventos por esse tipo) — não pode ser excluído nem ter a flag
-- is_system alterada por fora de uma migration. Última linha de defesa
-- hard-coded, mesmo padrão do protect_role_status_trigger
-- (0012_user_status_rewire.sql): bloqueia mesmo que a permissão dinâmica
-- tipos_evento:delete/edit esteja concedida.

alter table public.event_types add column is_system boolean not null default false;

update public.event_types set is_system = true where lower(name) = 'culto';

insert into public.event_types (name, is_system)
select 'Culto', true
where not exists (select 1 from public.event_types where is_system = true);

create or replace function public.protect_system_event_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_system then
      raise exception 'Tipo de evento nativo não pode ser excluído';
    end if;
    return old;
  end if;

  if new.is_system is distinct from old.is_system then
    raise exception 'Flag is_system não pode ser alterada';
  end if;
  return new;
end;
$$;

create trigger protect_system_event_type_delete_trigger
before delete on public.event_types
for each row execute function public.protect_system_event_type();

create trigger protect_system_event_type_update_trigger
before update on public.event_types
for each row execute function public.protect_system_event_type();
