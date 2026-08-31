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
- **Cadastro de equipes — concluído.** CRUD simples (nome, supervisor, cor do badge) em `/admin/equipes`.
- **Fases 3 (eventos) e 4 (crianças) — não iniciadas de verdade.** `/agenda` e `/eventos` existem como **conteúdo estático/mock** (só a estrutura visual do Figma), sem CRUD real ainda.
- **Fase 5 (manual dentro do sistema) — concluída, com uma decisão diferente do plano original:** o manual não ficou público; o usuário decidiu explicitamente que **toda a aplicação exige login**, manual incluso (rota `/manual`).

### Arquitetura efetivamente usada (vs. planejada na v1 deste documento)

| Item | Planejado | O que foi feito |
|---|---|---|
| ORM | Prisma ou SDK direto | **Sem ORM.** Cliente `@supabase/supabase-js` + `@supabase/ssr` direto. Migrations SQL manuais em `supabase/migrations/*.sql`, aplicadas via `node scripts/run-migration.js <arquivo>` (não há Supabase CLI configurado). |
| Provisionamento do banco | Criar projeto Supabase manualmente | Provisionado via **Vercel Marketplace** (`vercel integration add supabase`), o que já injeta as env vars no projeto Vercel automaticamente. Recurso: `supabase-byzantine-elephant`. |
| UI | Não definida | **Tailwind CSS v4 + shadcn/ui**, adotado a pedido do usuário no meio do projeto ("não tem uma biblioteca que traga essa beleza, mobile, web app?"). Ver `AGENTS.md` → Design e identidade visual. |
| Manual público vs. logado | A decidir na Fase 5 | Decidido: **logado**, sem exceção. |
| Navegação | Não definida | Barra inferior fixa (mobile-first), 5 abas: Início · Agenda · Eventos · Pessoas · Mais (espelhando `img/figma-design/*.png`). "Mais" é uma página própria (`app/(app)/mais/page.tsx`), não mais um sheet — reúne Semeando Tempo, Manual, itens mock (Escala de Serviço/Relatórios/Comunicados/Materiais) e, condicionado à permissão, Usuários/Equipes/Configurações/Permissões/Sair. |

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

- **Auto-cadastro bloqueado — implementado** (`0008_signup_approval.sql`): novo voluntário nasce `status = inactive`, sem acesso, até um admin aprovar em Usuários. **Passo manual pendente, fora do repo:** desabilitar "Confirm email" no dashboard do Supabase (Authentication → Sign In / Providers → Email) — sem isso, o próprio Supabase recusa o login antes da checagem de aprovação rodar.
- **Termo de Voluntariado anual — ainda não implementado.** No primeiro acesso do ano civil vigente, reter o voluntário numa tela de bloqueio até aceitar formalmente um termo.
- Documento original também menciona: auditoria documental, disparo global de notificações, RSVP de reuniões, download de roteiros pedagógicos, chamada dominical, checklist operacional de sala — nada disso existe ainda; fazem parte de fases futuras (provavelmente dentro de Fase 3/4 ou uma fase nova).

## 4. Modelo de dados

### Implementado (Postgres, via Supabase)

```sql
-- ver supabase/migrations/0001 a 0010_*.sql para o SQL real e comentado

profiles
  id uuid pk (fk auth.users)
  full_name text
  email text not null
  phone text not null default ''
  address text            -- opcional
  role user_role not null default 'volunteer'   -- admin | coordinator | leader | volunteer
  status user_status not null default 'active'  -- active | inactive (também é o gate de aprovação de cadastro)
  team_id uuid fk teams   -- opcional
  created_at timestamptz

app_settings (linha única, id boolean sempre true)
  primary_color text default '#8060FF'
  updated_at timestamptz

teams (cadastro de equipes)
  id uuid pk, name text, supervisor_id uuid fk profiles (opcional),
  color text default '#8060FF'  -- cor do badge sempre que o nome da equipe aparece
  created_at timestamptz

semeando_tempo_entries ("Semeando Tempo" — ex-"banco de horas")
  id uuid pk, user_id uuid fk profiles, entered_at date default hoje,
  note text (opcional), created_by uuid fk profiles, created_at timestamptz
  -- uma linha = uma vez que a pessoa entrou no banco de prontidão;
  -- tela agrupa por pessoa e conta linhas nos últimos 12 meses.

permission_domains (key text pk, label text)
permission_actions (domain_key fk, action_key text, label text)
role_permissions (role user_role, domain_key fk, action_key fk)
  -- RBAC dinâmico: existência da linha em role_permissions = permissão concedida.
  -- has_permission(domain, action) é a função SQL usada nas policies de RLS.
```

Convenção fixa do projeto: **todo nome de tabela/coluna/enum em inglês**, mesmo com o resto do app em português.

### Ainda não implementado (rascunho original, revisar antes de construir)

```
events (eventos)
  id, title, description, start_date, end_date, location,
  volunteer_slots, status (planned|open|closed), created_by (fk profiles)

event_registrations (inscrição de voluntários em eventos)
  id, event_id, user_id, status (registered|confirmed|cancelled), created_at

children (cadastro de crianças)
  id, name, birth_date, guardian_name, guardian_phone,
  allergies_notes, image_authorization (bool), created_at

event_children (crianças por evento)
  id, event_id, child_id, present (bool), notes
```

> **Atenção LGPD:** dados de crianças (saúde, responsável, imagem) e dados pessoais de voluntários são sensíveis. RLS restritiva (só admin/responsável do evento acessam), nunca exportar/expor fora do sistema, definir responsável interno pelo tratamento antes de abrir essas tabelas.

## 5. Fases do projeto

- [x] **Fase 0 — Fundação.** Next.js + Vercel + Supabase provisionados e conectados.
- [x] **Fase 1 — Login, cadastro, perfis.** Auth, `profiles`, RLS, telas de admin, RBAC dinâmico, aprovação manual de cadastro.
- [x] **Design system.** Tailwind v4 + shadcn/ui, mobile-first, redesign completo seguindo `img/figma-design/*.png` (nav de 5 abas, glassmorphism).
- [x] **Fase 2 — Semeando Tempo.** Lista de voluntários de prontidão pra cobrir escala, contagem por pessoa nos últimos 12 meses, histórico editável.
- [x] **Cadastro de equipes.** CRUD (nome, supervisor, cor) em `/admin/equipes`.
- [ ] **Fase 3 — Agenda + Eventos reais.** Hoje `/agenda` e `/eventos` são conteúdo estático (visual do Figma), sem CRUD real, sem inscrição de voluntários.
- [ ] **Fase 4 — Cadastro de crianças por evento.**
- [x] **Fase 5 — Unificar manual no sistema.** Feito, com o manual atrás de login (decisão do usuário, diferente do rascunho original que cogitava manual público).
- [x] **Aprovação manual de cadastro.** Implementado (`0008_signup_approval.sql`) — falta só o usuário desabilitar "Confirm email" no dashboard do Supabase (passo manual, ver seção 3).
- [ ] **Termo de Voluntariado anual** — ainda não implementado, avaliar prioridade quando chegar a vez.

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
    bottom-nav.tsx                -> barra inferior: Início/Agenda/Eventos/Pessoas/Mais
    page.js                      -> home ("/"), hero + acesso rápido + avisos (segue Figma)
    mais/page.tsx                 -> ex-sheet do menu; atalhos + perfil + sair
    agenda/, eventos/             -> conteúdo estático/mock (visual do Figma, sem domínio real)
    pessoas/page.tsx              -> listagem real de profiles + badge de equipe
    manual/page.js                -> manual (lib/manualBody.js), classe .manual-scope
    perfil/                       -> autoedição de perfil + logout
    semeando-tempo/               -> CRUD do banco de prontidão (actions.ts, page.tsx, dialogs)
    banco-de-horas/               -> só um redirect pra /semeando-tempo (rota antiga)
    calendario/                   -> placeholder antigo, não usado pela nav nova
    admin/usuarios/               -> CRUD completo (criar via service role, editar, aprovar/bloquear)
    admin/equipes/                -> CRUD de equipes
    admin/configuracoes/          -> configurações + permissoes/ (matriz RBAC dinâmica)
components/ui/                   -> componentes shadcn (+ table, dialog, dropdown-menu, checkbox, tabs)
components/crud/                 -> list-toolbar.tsx, delete-button.tsx (padrão de CRUD, ver AGENTS.md)
components/team-badge.tsx        -> badge colorido reutilizado em Usuários/Equipes/Semeando Tempo/Pessoas
lib/supabase/{client,server,middleware,admin}.ts  -> admin.ts = service role, só em Server Actions
lib/permissions.ts               -> getRolePermissions()/can() do RBAC dinâmico
lib/export.ts                    -> exportToExcel()/printArea() do padrão de CRUD
lib/manualBody.js                -> HTML do manual (extraído do site estático original)
supabase/migrations/*.sql        -> migrations SQL numeradas (0001 a 0010 até este ponto)
scripts/run-migration.js         -> aplica uma migration via POSTGRES_URL_NON_POOLING
scripts/create-test-user.mjs, screenshot.mjs  -> QA visual com Playwright (ver AGENTS.md)
img/figma-design/*.png           -> protótipos do Figma que guiaram o redesign
```

## 7. Próximos passos imediatos

1. **Usuário precisa desabilitar "Confirm email"** no dashboard do Supabase (Authentication → Sign In / Providers → Email) — sem isso, o autocadastro fica preso na tela de login com "Email not confirmed" antes mesmo da aprovação manual entrar em ação.
2. Revisar a matriz de permissões em `/admin/configuracoes/permissoes` e ajustar o que cada perfil pode fazer conforme o uso real (hoje só o admin tem tudo por padrão, exceto Semeando Tempo que também libera Coordenação/Supervisão).
3. Fase 3 (Agenda/Eventos reais, com inscrição de voluntários) — hoje é só mock visual.
4. Fase 4 (cadastro de crianças por evento) — atenção especial à LGPD antes de abrir.
5. Revisitar com o usuário se o Termo de Voluntariado anual ainda é prioridade, e em que fase encaixa.

## 8. Riscos / pontos de atenção

- **Pausa do Supabase por inatividade** (free tier, ~7 dias sem uso) — ainda não mitigado com nenhum ping/cron.
- **Dados sensíveis de crianças** — exige RLS bem definida e cuidado com LGPD antes de abrir a Fase 4.
- **Ambiente de dev tem histórico de bugs sérios de caminho (WSL via UNC)** — 4 bugs distintos já encontrados e contornados (npm.cmd, watcher do `next dev`, `tsc`, Turbopack/PostCSS). Ler a seção de ambiente em `AGENTS.md` antes de rodar qualquer `npm`/`next` — build/dev devem rodar nativo dentro do WSL, não pela ponte UNC.
- **Deploy:** sempre `./script_deploy.sh "descrição"`, sempre perguntar antes de rodar — regra explícita do usuário, já violada uma vez por engano no meio do projeto (não repetir).
- **Pacote `xlsx` (SheetJS) vem da npm registry, não da build corrigida da própria SheetJS** (instalar de URL externa foi bloqueado no ambiente de execução) — aceitável porque o uso é só de exportação, nunca parse de arquivo de usuário. Ver `AGENTS.md` → Padrão de CRUD.
- **Embeds do PostgREST entre `profiles` e `teams` são ambíguos** (duas FKs: `teams.supervisor_id` e `profiles.team_id`) — sempre nomear a constraint explicitamente na query (`teams!profiles_team_id_fkey` ou `profiles!teams_supervisor_id_fkey`), senão o Supabase recusa a query com PGRST201.
