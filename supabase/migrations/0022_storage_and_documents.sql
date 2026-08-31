-- Supabase Storage: buckets privados pra certidão de antecedentes e
-- roteiro de escala. storage.buckets/storage.objects são tabelas Postgres
-- normais (com RLS), dá pra criar/policiar numa migration comum.
insert into storage.buckets (id, name, public)
values ('volunteer-documents', 'volunteer-documents', false),
       ('scale-scripts', 'scale-scripts', false);

-- volunteer-documents: caminho "${user_id}/${arquivo}" — o próprio dono
-- mexe na própria pasta; admin/coordenação (has_permission) vê/mexe tudo.
create policy "volunteer documents select own or documentos permission"
on storage.objects for select to authenticated
using (
  bucket_id = 'volunteer-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.has_permission('documentos', 'view'))
);

create policy "volunteer documents insert own or documentos permission"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'volunteer-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.has_permission('documentos', 'edit'))
);

create policy "volunteer documents update requires documentos permission"
on storage.objects for update to authenticated
using (bucket_id = 'volunteer-documents' and public.has_permission('documentos', 'edit'))
with check (bucket_id = 'volunteer-documents' and public.has_permission('documentos', 'edit'));

create policy "volunteer documents delete requires documentos permission"
on storage.objects for delete to authenticated
using (bucket_id = 'volunteer-documents' and public.has_permission('documentos', 'delete'));

-- scale-scripts: visível a qualquer autenticado (quem vê a escala vê o
-- roteiro); escrita reaproveita o domínio "escalas" (é parte de gerenciar
-- a escala, mesmo raciocínio do script_url que já existe).
create policy "scale scripts are readable by authenticated users"
on storage.objects for select to authenticated
using (bucket_id = 'scale-scripts');

create policy "scale scripts insert requires escalas permission"
on storage.objects for insert to authenticated
with check (bucket_id = 'scale-scripts' and public.has_permission('escalas', 'create'));

create policy "scale scripts update requires escalas permission"
on storage.objects for update to authenticated
using (bucket_id = 'scale-scripts' and public.has_permission('escalas', 'edit'))
with check (bucket_id = 'scale-scripts' and public.has_permission('escalas', 'edit'));

create policy "scale scripts delete requires escalas permission"
on storage.objects for delete to authenticated
using (bucket_id = 'scale-scripts' and public.has_permission('escalas', 'delete'));

-- Certidão de antecedentes — metadado do arquivo (o binário fica no
-- Storage). valid_until calculado na Server Action (submitted_at + 6
-- meses), não por trigger — mais simples de ler e testar.
create table public.volunteer_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  file_path text not null,
  submitted_at date not null default current_date,
  valid_until date not null,
  created_at timestamptz not null default now()
);

alter table public.volunteer_documents enable row level security;

create policy "volunteer documents rows select own or permission"
on public.volunteer_documents for select to authenticated
using (user_id = auth.uid() or public.has_permission('documentos', 'view'));

create policy "volunteer documents rows insert own or permission"
on public.volunteer_documents for insert to authenticated
with check (user_id = auth.uid() or public.has_permission('documentos', 'edit'));

create policy "volunteer documents rows update requires permission"
on public.volunteer_documents for update to authenticated
using (public.has_permission('documentos', 'edit'))
with check (public.has_permission('documentos', 'edit'));

create policy "volunteer documents rows delete requires permission"
on public.volunteer_documents for delete to authenticated
using (public.has_permission('documentos', 'delete'));

alter table public.scales add column script_file_path text;

insert into public.permission_domains (key, label) values ('documentos', 'Documentos');

insert into public.permission_actions (domain_key, action_key, label) values
  ('documentos', 'view', 'Visualizar'),
  ('documentos', 'create', 'Criar'),
  ('documentos', 'edit', 'Editar'),
  ('documentos', 'delete', 'Excluir');

insert into public.role_permissions (role, domain_key, action_key)
select r, domain_key, action_key
from public.permission_actions, unnest(array['admin', 'coordinator']::public.user_role[]) as r
where domain_key = 'documentos';
