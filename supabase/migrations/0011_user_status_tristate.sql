-- Status do usuário vira 3 estados: pending (aguardando aprovação) /
-- approved (acesso liberado) / blocked (acesso revogado). Renomeia os
-- valores existentes em vez de criar enum novo, pra não quebrar o que já
-- referencia user_status. Sozinho no arquivo por causa do ADD VALUE (ver
-- 0004_coordinator_role.sql pro mesmo motivo).
alter type public.user_status rename value 'active' to 'approved';
alter type public.user_status rename value 'inactive' to 'blocked';
alter type public.user_status add value 'pending';
