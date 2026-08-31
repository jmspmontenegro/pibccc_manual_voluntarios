-- Regra de negócio explícita do usuário: Coordenação e Supervisão têm
-- acesso total ao Semeando Tempo por padrão (não só o admin). Continua
-- editável depois pela matriz dinâmica de permissões.
insert into public.role_permissions (role, domain_key, action_key)
select r, domain_key, action_key
from public.permission_actions, unnest(array['coordinator', 'leader']::public.user_role[]) as r
where domain_key = 'semeando_tempo';
