-- Recusar uma escala lança automaticamente uma entrada no banco de horas
-- Semeando Tempo (pedido do usuário, ver FLUXO_CADASTRO.md e card "Recusa
-- de escala" no Trello) — motivo = justificativa, concatenando o nome do
-- substituto indicado (opcional). Estendido na mesma transação de
-- respond_to_assignment (0018_scale_assignments.sql) pra nunca ficar
-- inconsistente (recusa registrada sem entrada, ou vice-versa).
--
-- Justificativa mínima de 3 palavras também é validada aqui (redundante
-- com `isValidDeclineReason` em lib/domain/decline-reason.ts, que só cobre
-- o client-side) — regra de negócio real precisa da barreira no banco,
-- não só na tela.
create or replace function public.respond_to_assignment(
  p_id uuid,
  p_status text,
  p_justification text default null,
  p_substitute_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text;
  v_substitute_name text;
  v_word_count int;
begin
  if p_status not in ('confirmed', 'declined') then
    raise exception 'status inválido: %', p_status;
  end if;

  if p_status = 'declined' then
    v_word_count := array_length(
      regexp_split_to_array(trim(coalesce(p_justification, '')), '\s+'),
      1
    );
    if coalesce(p_justification, '') = '' or v_word_count < 3 then
      raise exception 'Justificativa precisa de pelo menos 3 palavras.';
    end if;
  end if;

  update public.scale_assignments
  set
    confirmation_status = p_status,
    justification = p_justification,
    substitute_user_id = p_substitute_user_id,
    updated_at = now()
  where id = p_id
    and user_id = auth.uid();

  if not found then
    raise exception 'atribuição não encontrada ou não pertence ao usuário';
  end if;

  if p_status = 'declined' then
    if p_substitute_user_id is not null then
      select full_name into v_substitute_name from public.profiles where id = p_substitute_user_id;
    end if;

    v_reason := p_justification;
    if v_substitute_name is not null then
      v_reason := v_reason || ' — substituto indicado: ' || v_substitute_name;
    end if;

    insert into public.semeando_tempo_entries (user_id, entered_at, note, created_by)
    values (auth.uid(), current_date, v_reason, auth.uid());
  end if;
end;
$$;

-- Admin/Supervisor/Coordenação podem cancelar a confirmação/recusa de um
-- voluntário (pedido do usuário) — volta pra 'pending', limpa justificativa
-- e substituto. Não mexe no Semeando Tempo já lançado (histórico fica).
create or replace function public.cancel_assignment_confirmation(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission('escalas', 'edit') then
    raise exception 'Sem permissão para esta ação.';
  end if;

  update public.scale_assignments
  set
    confirmation_status = 'pending',
    justification = null,
    substitute_user_id = null,
    updated_at = now()
  where id = p_id;

  if not found then
    raise exception 'atribuição não encontrada';
  end if;
end;
$$;
