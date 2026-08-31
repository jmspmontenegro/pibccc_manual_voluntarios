-- Permite que outros perfis (ex.: Coordenação, Supervisão) editem campos
-- básicos de profiles (nome, telefone, endereço, equipe) quando a matriz
-- dinâmica conceder 'usuarios:edit' — sem depender de serem admin.
--
-- Isso NÃO abre brecha pra role/status: protect_role_status_trigger (ver
-- 0003_profile_fields_and_settings.sql) continua revertendo qualquer troca
-- de role/status que não venha de um admin de verdade, deliberadamente
-- hard-coded (não segue a matriz dinâmica) — troca de perfil/bloqueio é
-- sensível demais pra depender só de configuração, é a última linha de
-- defesa contra escalonamento de privilégio.
create policy "profiles update via usuarios permission"
on public.profiles for update to authenticated
using (public.has_permission('usuarios', 'edit'))
with check (public.has_permission('usuarios', 'edit'));
