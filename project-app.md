# Plano de Ação — Sistema de Voluntários (Start / PIBCCC)

> **Para o próximo agente:** este arquivo é o plano + status do projeto. Detalhes operacionais do ambiente (bugs de caminho UNC, como rodar build/dev, convenções de código, RBAC, deploy) estão em `AGENTS.md` — leia os dois antes de continuar. Não repita decisões já tomadas sem motivo novo.

## 1. Objetivo

Evoluir o "Manual do Voluntário" (originalmente um `index.html` estático) para um **sistema web completo** de gestão do ministério infantil Start: login, cadastro de usuários, perfis de acesso, cadastro de equipes, "Semeando Tempo" (banco de voluntários de prontidão), cadastro de eventos, inscrição em eventos, cadastro de crianças por evento. Mantendo:

- Deploy automático no Vercel a cada push na `main`, sempre via `./script_deploy.sh` (nunca `git push` direto) e **sempre com confirmação do usuário antes de publicar** — regra fixa do projeto.
- Arquitetura gratuita (Vercel Hobby + Supabase free tier).

## 2. Estado atual (o que já está em produção)

- **Fase 0 (fundação) — concluída.** Repositório convertido de HTML estático pra Next.js (App Router), publicado em `https://pibccc-manual-voluntarios.vercel.app`.
- **Fase 1 (login, cadastro, perfis) — concluída, evoluída.** Supabase Auth (email/senha), tabela `profiles`, 4 perfis (`admin`/`coordinator`/`leader`/`volunteer`, rótulos Administrador/Coordenação/Supervisor/Voluntário), RLS + trigger anti-escalação de privilégio, **aprovação manual de cadastro** (novo voluntário nasce bloqueado, admin aprova em Usuários), **RBAC dinâmico** configurável (`/admin/configuracoes/permissoes`), telas de admin (usuários, equipes, configurações, permissões).
- **Design system — evoluído pra redesign do Figma.** Tailwind CSS v4 + shadcn/ui (base-ui + lucide-react), mobile-first, navegação por barra inferior com 5 abas (Início/Agenda/Eventos/Pessoas/Mais, espelhando `img/figma-design/*.png`), utilities de glassmorphism (`glass`/`glass-dark`).
- **Fase 2 (Semeando Tempo, ex-"banco de horas") — concluída.** Voluntário que não pode ir na escala entra numa lista de prontidão pra cobrir falta de outra pessoa; tela lista por pessoa (nome, equipe, quantas vezes nos últimos 12 meses), com histórico editável. Ver seção 3/4 abaixo.
- **Cadastro de equipes — concluído.** CRUD (nome, supervisor, cor do badge, descrição, ativo) em `/admin/equipes`; elenco real de cada equipe (`team_members`, M:N) existe no banco, sem tela dedicada ainda (aguardando Fase B/Escalas usar).
- **Cadastro de Salas (`/admin/salas`) e Tipos de Evento (`/admin/tipos-evento`) — concluídos.** CRUDs simples; Tipos de Evento é restrito a admin/coordenação desde o seed da migration.
- **Usuário — evoluído.** Sala preferencial, data de nascimento, histórico de Semeando Tempo (somente leitura) e status em **3 estados** (Pendente/Aprovado/Bloqueado) no dialog de edição.
- **Fase B1 (Eventos + Escalas + Atribuições) — concluída.** `events`/`scales`/`scale_assignments` reais: evento com tipo/data/local/recorrência semanal simples, escala com atribuição individual ou em massa por equipe, confirmação/recusa do próprio voluntário (função SQL `respond_to_assignment`, não RLS direta), presença real marcada pela supervisão. `/eventos` (aba "Cultos") é a lista real, `/admin/eventos` é a gestão (admin/coordenação), `/eventos/[id]` é o detalhe. Home mostra a próxima escala de verdade. `/agenda` continua mock (Fase B2).
- **Fase B2a — Termo de Voluntariado + RSVP + Checklists — concluída.** Todo login passa pela tela de bloqueio do termo (`term_acceptances`, texto placeholder em `lib/terms.ts`) até aceitar. Evento sem escala ganha RSVP (confirmar/recusar presença); evento com escala usa checklist (catálogo de templates em `/admin/checklists` + instância aplicável em cada escala, com item marcável e autoria registrada).
- **Fase B2b — Certidão de Antecedentes + upload de roteiro — concluída.** Supabase Storage configurado (buckets privados `volunteer-documents`/`scale-scripts`, RLS, signed URL sob demanda). `/documentos` mostra a própria situação (Válido/Vencido/Nunca enviado, renovação a cada 6 meses) e, pra admin/coordenação, a lista de todo mundo. Escala ganhou upload de roteiro (arquivo, além do link que já existia). Aviso "Documento pendente" da Home agora é real. **Especificação original de Eventos/Escalas/Documentos está toda implementada.**
- **Fase 4 (crianças) — não iniciada, nem especificada ainda.**
- **Fase 5 (manual dentro do sistema) — concluída, com uma decisão diferente do plano original:** o manual não ficou público; o usuário decidiu explicitamente que **toda a aplicação exige login**, manual incluso (rota `/manual`, agora também um tab da nav inferior).

### Arquitetura efetivamente usada (vs. planejada na v1 deste documento)

| Item | Planejado | O que foi feito |
|---|---|---|
| ORM | Prisma ou SDK direto | **Sem ORM.** Cliente `@supabase/supabase-js` + `@supabase/ssr` direto. Migrations SQL manuais em `supabase/migrations/*.sql`, aplicadas via `node scripts/run-migration.js <arquivo>` (não há Supabase CLI configurado). |
| Provisionamento do banco | Criar projeto Supabase manualmente | Provisionado via **Vercel Marketplace** (`vercel integration add supabase`), o que já injeta as env vars no projeto Vercel automaticamente. Recurso: `supabase-byzantine-elephant`. |
| UI | Não definida | **Tailwind CSS v4 + shadcn/ui**, adotado a pedido do usuário no meio do projeto ("não tem uma biblioteca que traga essa beleza, mobile, web app?"). Ver `AGENTS.md` → Design e identidade visual. |
| Manual público vs. logado | A decidir na Fase 5 | Decidido: **logado**, sem exceção. |
| Navegação | Não definida | Barra inferior fixa (mobile-first, **fundo sólido, sem glass** — pedido explícito), 5 abas: Início · Agenda · Cultos (era "Eventos" — mesma rota `/eventos` por enquanto, é alias visual até `event_types` existir de verdade) · Manual · Mais (era "Pessoas" — a página `/pessoas` continua existindo, só virou um link dentro de `/mais`). "Mais" é uma página própria (`app/(app)/mais/page.tsx`) — reúne Semeando Tempo, Pessoas, Manual, itens mock (Escala de Serviço/Relatórios/Comunicados/Materiais) e, condicionado à permissão, Usuários/Equipes/Salas/Tipos de Evento/Configurações/Permissões/Sair. |
| Select do shadcn/base-ui | — | Precisa da prop `items` (mapa valor→rótulo) pra `<SelectValue>` mostrar o rótulo em vez do valor cru — bug descoberto e corrigido em todos os `<Select>` do app nesta fase. Ver `AGENTS.md` → Design e identidade visual. |
| Listagem de CRUD | `<Table>` | **Cards**, não tabela — o usuário achou a tabela datada/pouco mobile-friendly, validou o card em Usuários e pediu pra replicar. Aplicado em Usuários/Equipes/Salas/Tipos de Evento/Semeando Tempo. `<Table>` sobrevive só pra grades reais (matriz de Permissões). |

## 3. Perfis de acesso (roles)

Enum `public.user_role`: `admin`, `coordinator` (rótulo **Coordenação**), `leader` (rótulo **Supervisor**), `volunteer`.

| Perfil | Permissões |
|---|---|
| **Admin** | Acesso total a tudo, sempre — toda migration de domínio novo já concede isso (convenção, ver `AGENTS.md` → RBAC dinâmico). Único perfil que pode mudar `role`/`status` de outro usuário (hard-coded no trigger, não pela matriz dinâmica). |
| **Coordenação** (`coordinator`) | Acesso total ao Semeando Tempo por padrão (regra de negócio explícita); demais domínios ficam configuráveis pela tela de Permissões. |
| **Supervisor** (`leader`) | Igual à Coordenação: acesso total ao Semeando Tempo por padrão; demais domínios configuráveis. Responsável indicado nas Equipes. |
| **Voluntário** | Vê manual, perfil próprio, Pessoas (leitura). No Semeando Tempo, só enxerga as próprias entradas (nunca a lista completa), mesmo sem permissão de domínio — regra fixa em RLS, não na matriz. |

RLS no Postgres é a camada autoritativa (não a checagem de página) — ver `AGENTS.md`. Trigger `protect_role_status_trigger` impede qualquer troca de `role`/`status` que não venha de um admin autenticado de verdade.

### RBAC dinâmico (implementado)

Perfil × domínio × ação, configurável em `/admin/configuracoes/permissoes` sem precisar de deploy. Ver `AGENTS.md` → "RBAC dinâmico" pro modelo de dados (`permission_domains`/`permission_actions`/`role_permissions`/`has_permission()`).

### Especificação de RBAC/compliance recebida do usuário — status atualizado

- **Auto-cadastro bloqueado — implementado**: novo voluntário nasce `status = pending`, sem acesso, até um admin aprovar em Usuários (vira `approved`). **Passo manual pendente, fora do repo:** desabilitar "Confirm email" no dashboard do Supabase (Authentication → Sign In / Providers → Email) — sem isso, o próprio Supabase recusa o login antes da checagem de aprovação rodar.
- **Status em 3 estados (Pendente/Aprovado/Bloqueado) — implementado** (`0011_user_status_tristate.sql`/`0012_user_status_rewire.sql`), a pedido explícito do usuário. Só quem tem `usuarios:edit` muda.
- **Termo de Voluntariado + Certidão de Antecedentes semestral — ainda não implementados.** Fazem parte da especificação de "Documentos" que o usuário mandou junto com a arquitetura de Eventos/Escalas — ver seção 5 (Fase B).
- Documento original também menciona: auditoria documental, disparo global de notificações — ainda não existem; ficam pra alguma fase futura, fora do escopo já especificado de Eventos/Escalas/Documentos.

## 4. Modelo de dados

### Implementado (Postgres, via Supabase)

```sql
-- ver supabase/migrations/0001 a 0015_*.sql para o SQL real e comentado

profiles
  id uuid pk (fk auth.users)
  full_name text
  email text not null
  phone text not null default ''
  address text            -- opcional
  birth_date date         -- opcional (aniversariantes do mês na Home)
  role user_role not null default 'volunteer'      -- admin | coordinator | leader | volunteer
  status user_status not null default 'pending'    -- pending | approved | blocked
  team_id uuid fk teams               -- opcional, "equipe principal" (badge)
  preferred_room_id uuid fk rooms     -- opcional
  created_at timestamptz

app_settings (linha única, id boolean sempre true)
  primary_color text default '#8060FF'
  updated_at timestamptz

teams (cadastro de equipes)
  id uuid pk, name text, description text, active boolean default true,
  supervisor_id uuid fk profiles (opcional),
  color text default '#8060FF'  -- cor do badge sempre que o nome da equipe aparece
  created_at timestamptz

team_members (elenco real de cada equipe, M:N — usado pela Fase B/Escalas)
  id uuid pk, team_id fk teams, user_id fk profiles, role text default 'volunteer',
  active boolean default true, created_at timestamptz, unique(team_id, user_id)

rooms (cadastro de salas)
  id uuid pk, name text, description text, location text,
  active boolean default true, created_at timestamptz

event_types (cadastro de tipos de evento — Culto, Reunião, etc; admin+coordenação)
  id uuid pk, name text, description text, active boolean default true, created_at timestamptz

semeando_tempo_entries ("Semeando Tempo" — ex-"banco de horas")
  id uuid pk, user_id uuid fk profiles, entered_at date default hoje,
  note text (motivo da falta, obrigatório na UI), created_by uuid fk profiles, created_at timestamptz
  -- uma linha = uma vez que a pessoa entrou no banco de prontidão;
  -- tela lista uma linha por entrada, com a contagem de 12 meses daquela pessoa ao lado.

permission_domains (key text pk, label text)
permission_actions (domain_key fk, action_key text, label text)
role_permissions (role user_role, domain_key fk, action_key fk)
  -- RBAC dinâmico: existência da linha em role_permissions = permissão concedida.
  -- has_permission(domain, action) é a função SQL usada nas policies de RLS.

events ("o que, quando, onde" — não confundir com escala)
  id uuid pk, event_type_id fk event_types, title, description, date, start_time, end_time,
  location, status text default 'planned', recurrence_group_id uuid (opcional, liga ocorrências
  geradas por recorrência semanal), created_by fk profiles

scales ("existe equipe de serviço pra esse evento?")
  id uuid pk, event_id fk events, name, status text default 'draft',
  script_url text (link do roteiro — upload de arquivo é Fase B2), created_by fk profiles

scale_assignments ("quem faz o quê")
  id uuid pk, scale_id fk scales, team_id fk teams (opcional), user_id fk profiles (opcional),
  room_id fk rooms (opcional), role text, confirmation_status (pending|confirmed|declined),
  justification text, substitute_user_id fk profiles (opcional), attendance_status (not_marked|present|absent)
  -- regra: team_id OU user_id precisa estar preenchido (constraint no banco).
  -- atribuição em massa por equipe sempre resolve pra 1 linha por membro (team_id+user_id
  -- preenchidos); team_id sozinho existe no schema mas nenhuma tela cria esse caso ainda.

respond_to_assignment(id, status, justification, substitute_user_id) -- função SQL security definer:
  só o dono (user_id = auth.uid()) confirma/recusa a própria atribuição, sem precisar de
  has_permission('escalas','edit') (que abriria edição de qualquer atribuição).
```

Convenção fixa do projeto: **todo nome de tabela/coluna/enum em inglês**, mesmo com o resto do app em português.

### Fase B2 — ainda não implementado (especificação detalhada já recebida do usuário, ver histórico da conversa)

RSVP separado de confirmação de escala, checklists por template ou ad hoc, upload de roteiro/documentos, certidão de antecedentes semestral e termo de voluntariado. Precisa de Supabase Storage (ainda não configurado no projeto). Rascunho de tabelas:

```
event_rsvps (id, event_id fk events, user_id fk profiles, status, justification)
checklist_templates (id, name) / checklist_template_items (id, template_id, label, position)
scale_checklists (id, scale_id fk scales unique, name) / scale_checklist_items (id, scale_checklist_id, label, position, checked, checked_by, checked_at)

volunteer_documents (certidão de antecedentes semestral)
  id, user_id fk profiles, file_path (Supabase Storage), submitted_at, valid_until (submitted_at + 6 meses), status
term_acceptances (termo de voluntariado)
  id, user_id fk profiles, term_version, accepted_at
```

children (cadastro de crianças por evento) ainda nem foi detalhado pelo usuário — fica pra depois da Fase B de Eventos/Escalas.

> **Atenção LGPD:** dados de crianças (saúde, responsável, imagem), certidão de antecedentes e dados pessoais de voluntários são sensíveis. RLS restritiva (só admin/responsável do evento/coordenação acessam), nunca exportar/expor fora do sistema, Supabase Storage com buckets privados (nunca público) antes de abrir essas tabelas.

## 5. Fases do projeto

- [x] **Fase 0 — Fundação.** Next.js + Vercel + Supabase provisionados e conectados.
- [x] **Fase 1 — Login, cadastro, perfis.** Auth, `profiles`, RLS, telas de admin, RBAC dinâmico, aprovação manual de cadastro.
- [x] **Design system.** Tailwind v4 + shadcn/ui, mobile-first, redesign completo seguindo `img/figma-design/*.png` (nav de 5 abas, glassmorphism).
- [x] **Fase 2 — Semeando Tempo.** Lista de voluntários de prontidão pra cobrir escala (uma linha por entrada), contagem por pessoa nos últimos 12 meses, buscador de voluntário, editar/excluir pelo lápis.
- [x] **Cadastro de equipes, salas e tipos de evento.** CRUDs em `/admin/equipes`, `/admin/salas`, `/admin/tipos-evento`.
- [x] **Usuário — sala preferencial, nascimento, histórico Semeando Tempo, status em 3 estados.**
- [x] **Fase B1 — Eventos + Escalas + Atribuições.** `events`/`scales`/`scale_assignments` reais, recorrência semanal simples, atribuição individual e em massa por equipe, confirmação/recusa do voluntário (`respond_to_assignment`), presença real da supervisão. `/eventos` (Cultos), `/admin/eventos`, `/eventos/[id]`. Home com próxima escala real.
- [x] **Fase B2a — Termo de Voluntariado + RSVP + Checklists.**
- [x] **Fase B2b — Certidão de Antecedentes + upload de roteiro (Supabase Storage).** Especificação original de Eventos/Escalas/Documentos 100% implementada.
- [ ] **Fase 4 — Cadastro de crianças por evento.** Nem especificado ainda pelo usuário.
- [x] **Fase 5 — Unificar manual no sistema.** Feito, com o manual atrás de login (decisão do usuário, diferente do rascunho original que cogitava manual público); agora também é um tab da nav inferior.
- [x] **Aprovação manual de cadastro + status em 3 estados.** Implementado — falta só o usuário desabilitar "Confirm email" no dashboard do Supabase (passo manual, ver seção 3).

## 6. Estrutura de pastas (atual, não mais "alvo")

```
app/
  layout.js                      -> layout raiz (fontes, injeta cor primária de app_settings)
  globals.css                    -> @import "tailwindcss" + @theme inline (bridge pros tokens shadcn)
                                     + utilities glass/glass-dark + CSS legado do manual (.manual-scope)
  login/, cadastro/               -> públicas, fora do grupo (app), redesenhadas (glass + logo)
  auth/actions.ts                -> server actions: login (checa status), signup, logout
  (app)/                         -> route group autenticado (layout central faz o auth-gate)
    layout.tsx                   -> redireciona se não logado, envolve em .print-scope, renderiza BottomNav
    bottom-nav.tsx                -> barra inferior sólida: Início/Agenda/Cultos/Manual/Mais
    page.js                      -> home ("/"), hero sólido + avisos (ordem: escala/documento/reunião) + aniversariantes
    mais/page.tsx                 -> atalhos (Semeando Tempo, Pessoas, Manual, admin...) + perfil + sair
    agenda/                       -> conteúdo estático/mock (visual do Figma, sem domínio real)
    eventos/                      -> lista real (Cultos na nav) + [id]/ (detalhe evento+escala+atribuições)
                                     + actions.ts (createEvent/updateEvent/deleteEvent/createScale/
                                     addAssignment/addTeamAssignments/updateAssignment/deleteAssignment/
                                     respondToAssignment)
    pessoas/page.tsx              -> listagem real de profiles + badge de equipe (link fica em /mais agora)
    manual/page.js                -> manual (lib/manualBody.js), classe .manual-scope
    perfil/                       -> autoedição de perfil + logout
    semeando-tempo/               -> CRUD (uma linha por entrada), entry-form-dialog.tsx unifica criar/editar
    banco-de-horas/               -> só um redirect pra /semeando-tempo (rota antiga)
    calendario/                   -> placeholder antigo, não usado pela nav nova
    admin/usuarios/               -> CRUD completo (sala/nascimento/histórico/status 3-estados)
    admin/equipes/                -> CRUD de equipes
    admin/salas/, admin/tipos-evento/  -> CRUDs simples (mesmo padrão de equipes)
    admin/eventos/                -> gestão de eventos (admin/coordenação), reaproveita actions.ts de eventos/
    admin/configuracoes/          -> configurações + permissoes/ (matriz RBAC dinâmica)
components/ui/                   -> componentes shadcn (+ table, dialog, dropdown-menu, checkbox, tabs)
components/crud/                 -> list-toolbar.tsx, delete-button.tsx, person-picker.tsx (padrão de CRUD, ver AGENTS.md)
components/team-badge.tsx        -> badge colorido reutilizado em Usuários/Equipes/Semeando Tempo/Pessoas
lib/supabase/{client,server,middleware,admin}.ts  -> admin.ts = service role, só em Server Actions
lib/permissions.ts               -> getRolePermissions()/can() do RBAC dinâmico
lib/export.ts                    -> exportToExcel()/printArea() do padrão de CRUD
lib/manualBody.js                -> HTML do manual (extraído do site estático original)
supabase/migrations/*.sql        -> migrations SQL numeradas (0001 a 0018 até este ponto)
scripts/run-migration.js         -> aplica uma migration via POSTGRES_URL_NON_POOLING
scripts/create-test-user.mjs, screenshot.mjs  -> QA visual com Playwright (ver AGENTS.md)
img/figma-design/*.png           -> protótipos do Figma que guiaram o redesign
```

## 7. Próximos passos imediatos

1. **Usuário precisa desabilitar "Confirm email"** no dashboard do Supabase (Authentication → Sign In / Providers → Email) — sem isso, o autocadastro fica preso na tela de login com "Email not confirmed" antes mesmo da aprovação manual entrar em ação.
2. Revisar a matriz de permissões em `/admin/configuracoes/permissoes` e ajustar o que cada perfil pode fazer conforme o uso real.
3. **Combinar com o usuário antes de começar a Fase B2** (RSVP/Checklists/Documentos/Termo de Voluntariado) — precisa configurar Supabase Storage do zero.
4. Fase 4 (cadastro de crianças por evento) — nem especificado ainda, atenção especial à LGPD antes de abrir.
5. `/agenda` ainda é mock — decidir se vira uma visão de calendário real sobre `events`/`scales` (Fase B1 já tem o dado, só falta a UI de calendário) ou se fica assim.

## 8. Riscos / pontos de atenção

- **Pausa do Supabase por inatividade** (free tier, ~7 dias sem uso) — ainda não mitigado com nenhum ping/cron.
- **Dados sensíveis de crianças** — exige RLS bem definida e cuidado com LGPD antes de abrir a Fase 4.
- **Ambiente de dev tem histórico de bugs sérios de caminho (WSL via UNC)** — 4 bugs distintos já encontrados e contornados (npm.cmd, watcher do `next dev`, `tsc`, Turbopack/PostCSS). Ler a seção de ambiente em `AGENTS.md` antes de rodar qualquer `npm`/`next` — build/dev devem rodar nativo dentro do WSL, não pela ponte UNC.
- **Deploy:** sempre `./script_deploy.sh "descrição"`, sempre perguntar antes de rodar — regra explícita do usuário, já violada uma vez por engano no meio do projeto (não repetir).
- **Pacote `xlsx` (SheetJS) vem da npm registry, não da build corrigida da própria SheetJS** (instalar de URL externa foi bloqueado no ambiente de execução) — aceitável porque o uso é só de exportação, nunca parse de arquivo de usuário. Ver `AGENTS.md` → Padrão de CRUD.
- **Embeds do PostgREST entre `profiles` e `teams` são ambíguos** (duas FKs: `teams.supervisor_id` e `profiles.team_id`) — sempre nomear a constraint explicitamente na query (`teams!profiles_team_id_fkey` ou `profiles!teams_supervisor_id_fkey`), senão o Supabase recusa a query com PGRST201.
- **`<Select>` do shadcn/base-ui precisa da prop `items`** pra `<SelectValue>` mostrar o rótulo em vez do valor cru — pego e corrigido em todos os Selects existentes nesta fase, mas é fácil esquecer num Select novo. Ver `AGENTS.md` → Design e identidade visual.
- **Nunca rodar `pkill -f "next start"` na mesma chamada de shell que sobe o `next start`** — o padrão casa contra o próprio comando que o invoca e mata o processo antes dele subir (falha silenciosa). Usar `fuser -k <porta>/tcp` numa chamada separada. Ver `AGENTS.md` → QA visual.
