<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions

## Mobile first

Every new page, component, or style must be designed and built mobile-first: base styles target small screens, `min-width` media queries scale up. Over 90% of real usage happens on phones during church services/classes, not desktops.

## Design e identidade visual

- Estética clean e objetiva, baixa carga cognitiva: telas para voluntários operando em sala de aula, elementos grandes e acionáveis com um toque.
- Fundo predominantemente claro (`--cream`/`--white`), ações e navegação em roxo/indigo. A paleta existe em `app/globals.css` como `--orange*` (nome legado — a cor em si já é roxo/indigo, não laranja).
- **Stack de UI: Tailwind CSS v4 + shadcn/ui** (`components/ui/*`, base `@base-ui/react`, ícones `lucide-react`). `app/globals.css` faz a ponte entre os tokens `--orange*`/`--cream`/etc e os tokens que os componentes shadcn esperam (`bg-primary`, `text-muted-foreground`, `--radius-*`) via um bloco `@theme inline`. Usar os componentes de `components/ui` em vez de HTML cru sempre que existir um equivalente (Button, Card, Input, Select, Sheet, Badge, Alert...).
- **Nunca adicionar seletor de tag genérica (`p`, `a`, `button`, `h1`...) ou `*` fora de uma classe escopada em `app/globals.css`.** O CSS legado do manual (extraído do site estático original) já causou um bug real assim: um `p { color: ... }` sem camada (`@layer`) vencia qualquer utilitário Tailwind (`.text-white` etc.) em **todas** as páginas, não só no manual — porque no CSS moderno, regra fora de `@layer` sempre vence regra dentro de `@layer`, não importa a especificidade. Por isso todo o CSS legado do manual está dentro de `.manual-scope { ... }` (ver `app/(app)/manual/page.js`, que aplica essa classe no wrapper). Se precisar adicionar mais CSS legado/global, ou escopa numa classe, ou usa `@layer base`/`@layer utilities` como o Tailwind espera.
- **Glassmorphism:** utilities `glass` (cards claros translúcidos) e `glass-dark` (sobre o gradiente roxo — hero, nav, cartão de perfil) definidas em `app/globals.css` via `@utility` do Tailwind v4. Usar em vez de `bg-white/55 backdrop-blur` inline pra manter consistência.
- O redesign visual (nav inferior de 5 abas, cards de acesso rápido, avisos, etc.) segue os protótipos em `img/figma-design/*.png`. Domínios que ainda não existem no app (Agenda, Eventos, itens extras de "Mais") ficam com conteúdo estático/mock só pra reproduzir a estrutura visual — não inventar CRUD real pra eles sem o usuário pedir.
- Sem emoji em código/UI a menos que pedido explicitamente.
- **Conferir visualmente antes de dizer que terminou.** Não basta o build passar — rode o servidor local e olhe a página renderizada (ver seção de QA visual abaixo) antes de reportar uma mudança de UI como pronta.

## Arquitetura de código (Clean Code)

- **Separação de conceitos:** regra de negócio e validação não devem viver dentro de Server Actions "flat" nem em componentes de UI quando a lógica crescer além de um CRUD simples — extrair para `lib/` (camada de domínio) conforme o projeto avança para bancos de horas, eventos, etc.
- **Responsabilidade única:** uma função faz uma coisa só (ex.: uma função que valida documento não também dispara notificação).
- **Nomes autoexplicativos e orientados ao domínio:** `isVolunteerCompliant(user)`, não `checkUserDoc(u)`.
- **Testabilidade:** lógica de domínio isolada de I/O (banco, rede) para poder ser testada sem mocks pesados. Framework de testes ainda não definido — escolher quando o primeiro módulo com regra de negócio real (banco de horas) começar.

## Controle de acesso (RBAC)

- Quatro perfis no enum `public.user_role`: `admin` (rótulo "Administrador"), `coordinator` (rótulo "Coordenação"), `leader` (rótulo "Supervisor"), `volunteer` (rótulo "Voluntário"). Ver `ROLE_LABEL` em `app/(app)/page.js`, `app/(app)/mais/page.tsx` e `app/(app)/admin/usuarios/user-edit-dialog.tsx`.
- **RLS no Postgres é a camada autoritativa**, não a checagem de página. Toda página/Server Action que restringe por perfil também deve ter policy de RLS equivalente na tabela — a checagem no componente é só UX (evita o usuário nem ver a tela antes do banco recusar), nunca a única barreira. O layout `app/(app)/layout.tsx` centraliza a checagem de "está logado" pra todas as rotas do grupo.
- O trigger `protect_role_status_trigger` na tabela `profiles` reverte silenciosamente qualquer tentativa de mudar `role`/`status` que não venha de um admin autenticado (`auth.uid()`) — inclusive updates feitos com a service role key sem uma sessão JWT real (útil saber ao escrever scripts de seed/teste — precisa desabilitar o trigger, fazer o update, reabilitar). **Isso é deliberado e não segue a matriz dinâmica abaixo:** troca de perfil/bloqueio é sensível demais (escalonamento de privilégio) pra depender só de configuração — é a última linha de defesa, hard-coded pra `role = 'admin'` de verdade.
- Dados de voluntários e de crianças são sensíveis (LGPD) — ver `project-app.md`.

### RBAC dinâmico (perfis × domínios × ações)

Além do enum de perfis, existe uma matriz configurável em tempo de execução — tela `/admin/configuracoes/permissoes` (hard-gated pra admin real, não pela própria matriz que ela edita):

- `permission_domains(key, label)` — uma área do sistema (`usuarios`, `equipes`, `semeando_tempo`, `configuracoes`, ...).
- `permission_actions(domain_key, action_key, label)` — quais ações existem em cada domínio (normalmente `view`/`create`/`edit`/`delete`, mas um domínio pode ter ações próprias, ex. `send`/`upload`, quando fizer sentido).
- `role_permissions(role, domain_key, action_key)` — a existência da linha É a permissão concedida.
- `public.has_permission(domain, action) returns boolean` (SQL, `security definer`) — resolve o `role` do `auth.uid()` e checa `role_permissions`. **Usada dentro das policies de RLS de cada domínio**, não substitui RLS (ver regra de ouro acima).
- `lib/permissions.ts` — `getRolePermissions()`/`can()`, versão client-side (Server Component) da mesma checagem, só pra UX.

**Convenção obrigatória: toda migration que cria um domínio novo já insere as ações desse domínio em `permission_actions` e concede acesso total ao `admin` em `role_permissions`.** Outros perfis (coordenação/supervisão/voluntário) só ganham acesso por essa mesma migration quando é uma regra de negócio explícita (ex.: `0010_semeando_tempo_role_seed.sql` dá acesso total a `coordinator`/`leader` porque o usuário pediu isso especificamente) — fora isso, ficam configuráveis depois pela tela de Permissões. Ver `supabase/migrations/0005_permissions_framework.sql` a `0007_semeando_tempo.sql` como referência do padrão.

### Aprovação manual de cadastro (implementado)

Todo cadastro público (`/cadastro`) nasce `role = volunteer`, `status = inactive` (ver `handle_new_user()` em `0008_signup_approval.sql`) — sem acesso, até um admin/coordenação com permissão `usuarios:edit` mudar o status pra `active` em `/admin/usuarios`. Usuário criado direto pela tela de Usuários (não pelo cadastro público) já nasce `active` — ver `createUser` em `app/(app)/admin/usuarios/actions.ts`.

**Pendente (passo manual, fora do repo):** desabilitar "Confirm email" em Authentication → Sign In / Providers → Email no dashboard do Supabase. Sem isso, `signInWithPassword` recusa o login com "Email not confirmed" *antes* da checagem de `status` rodar — o código já assume que esse toggle vai estar desligado.

### Planejado, ainda não implementado (não assumir que já existe)

- **Termo de Voluntariado anual:** no primeiro acesso do ano civil vigente, o voluntário deveria ficar retido numa tela de bloqueio (overlay) até aceitar o termo. Ainda não existe.

## Padrão de CRUD

Todo CRUD do app (Usuários, Equipes, Semeando Tempo, e os que vierem depois) segue o mesmo formato — listagem com busca/ordenação, exportar/imprimir, editar, ações contextuais:

- `components/crud/list-toolbar.tsx` — busca (`?q=`) com debounce e ordenação (`?sort=`) como query params (a página, Server Component, refaz a query no banco a partir deles); botões Exportar Excel / Imprimir atuam só sobre as linhas já carregadas na tela.
- `lib/export.ts` — `exportToExcel(rows, filename)` usa o pacote `xlsx` (SheetJS). **Recebe as linhas já achatadas** (`{ "Nome": "...", "E-mail": "..." }`), nunca `rows + columns` com função: função não atravessa a fronteira Server → Client Component como prop (React Server Components só serializam dados). Monte o array achatado no Server Component da página e passe pronto pro `ListToolbar`.
  - O pacote vem da npm registry normal (`xlsx@0.18.5`), não da build corrigida que a SheetJS distribui só pelo próprio CDN — instalar de URL externa é bloqueado neste ambiente. Isso é aceitável aqui porque o uso é só de **exportação** (nunca faz parse de arquivo enviado por usuário); os CVEs conhecidos do pacote são todos no caminho de leitura/parse.
  - Impressão usa `window.print()` + CSS em `app/globals.css` (`.print-scope`/`.print-area`, dentro de `@layer utilities`) — o layout autenticado (`app/(app)/layout.tsx`) já envolve tudo em `.print-scope`; cada página só precisa marcar a área a imprimir com `className="print-area"`.
- `components/crud/delete-button.tsx` — botão de excluir genérico (confirm + chama a Server Action + `router.refresh()`).
- Formulários de criar/editar usam `Dialog` (shadcn) + Server Action chamada programaticamente de dentro de um Client Component (via `useTransition`, não `<form action={...}>` direto) pra poder fechar o dialog e dar `router.refresh()` no sucesso — ver `app/(app)/admin/equipes/team-form-dialog.tsx` como referência.
- Toda tela de listagem também checa `has_permission`/`can()` (ver RBAC dinâmico acima) pra decidir se mostra os botões de criar/editar/excluir — a permissão de verdade é imposta pela RLS/Server Action, isso aqui é só UX.

## Banco de dados

- Todo nome de tabela/coluna/enum em **inglês** (`profiles`, `full_name`, `user_role`, etc.) — decisão explícita do usuário, mesmo com o resto do app em português.
- Migrations em `supabase/migrations/*.sql`, numeradas e aplicadas manualmente via `node scripts/run-migration.js <arquivo>` (não há Supabase CLI configurado neste projeto — a conexão usa `POSTGRES_URL_NON_POOLING` do `.env.local`, com `ssl: { rejectUnauthorized: false }` porque o driver `pg` quebra a verificação de certificado do pooler da Supabase quando a query string tem `sslmode=`).

## Ambiente de desenvolvimento (Windows + WSL)

O repositório físico mora no WSL (`/home/projetos/pibccc_manual_voluntarios`, ext4 nativo). Ele também é visível do lado Windows via caminho UNC (`\\wsl.localhost\Ubuntu\home\projetos\pibccc_manual_voluntarios`) — os dois caminhos são o **mesmo arquivo físico**, só a forma de acessar muda.

**Regra prática: editar de qualquer lado é seguro, mas `npm install`/`npm run build`/`next dev`/`next start` devem sempre rodar de dentro do WSL nativo, nunca através do caminho UNC.** Node/npm/Turbopack/tsc fazem sua própria manipulação de path/glob que quebra especificamente sobre esse caminho UNC — já vimos 4 bugs distintos assim (npm.cmd não suporta `cd` pra UNC via cmd.exe, o watcher do `next dev` gera falso positivo de "diretório deletado" em loop infinito, o `matchFiles` do `tsc` não enumera arquivos ali, e o Turbopack/PostCSS do Tailwind confunde dois formatos de path UNC e recusa arquivos de dentro do próprio projeto). Rodar nativo no WSL evita todos esses problemas de uma vez — é por isso que o build agora roda assim, e o type-check do `next build` está **ativo normalmente** (não precisa mais de `ignoreBuildErrors`).

Node dentro do WSL vem de nvm, não do pacote do sistema (esse é v12, velho demais pro Next 16):

```bash
wsl.exe -e bash -lc 'export NVM_DIR=/root/.nvm; source $NVM_DIR/nvm.sh; nvm use v26.2.0; cd /home/projetos/pibccc_manual_voluntarios && npm run build'
```

Esse é o padrão pra qualquer comando de install/build/start vindo de uma ferramenta Windows (Claude Code, outro terminal, etc.) — chamar `wsl.exe -e bash -lc '...'` em vez de rodar direto no caminho UNC.

`node_modules` instalado pelo lado Windows tem binários nativos (esbuild, lightningcss/@tailwindcss/oxide, playwright) compilados pra Windows, incompatíveis com o WSL — se algo parecer quebrado depois de mexer em dependências pelo lado Windows, apagar `node_modules` e rodar `npm install` de dentro do WSL de novo resolve.

Ainda assim, se por algum motivo só o lado Windows estiver disponível: `node ./node_modules/next/dist/bin/next build` (bypassa o `npm.cmd`), modo produção (`next build && next start`, não `next dev`) pra testar local, e `npm_config_script_shell="C:\\Program Files\\Git\\bin\\bash.exe" npm install ...` pra scripts de instalação com build nativo.

## QA visual (Playwright)

Antes de reportar uma mudança de UI como pronta, **olhe a tela renderizada de verdade**, não só "o build passou". Rodar o servidor local (`next start`, mesma lógica do build) e usar Playwright (instalado como devDependency) pra navegar e tirar screenshot — depois ler o PNG com a ferramenta de leitura de imagem.

- `scripts/create-test-user.mjs`: cria (ou recria) um usuário descartável `design-preview@example.com` via Supabase Admin API e tenta promover a admin — mas a promoção por API é **barrada de propósito** pelo trigger `protect_role_status_trigger` (não tem sessão/JWT, `auth.uid()` vem nulo). Pra realmente promover esse usuário de teste, rodar SQL direto desabilitando o trigger, setando **`role = 'admin'` e `status = 'active'`** (desde a aprovação manual de cadastro, todo usuário não-primeiro nasce `inactive`) e reabilitando o trigger em seguida — ver o padrão usado em `scripts/promote-test-admin.sql`, já removido do repo por ser descartável (recriar quando precisar).
- `scripts/screenshot.mjs`: script Playwright que loga com esse usuário e tira screenshot de cada rota principal. Ajustar a lista de rotas conforme o projeto crescer.
- Sempre **apagar o usuário de teste** depois (`supabase.auth.admin.deleteUser`) — não deixar lixo na tabela `profiles`.
- Viewport mobile-first por padrão (390×844) já que é o alvo principal.

## Deploy

- Todo deploy pra `main`/produção passa por `./script_deploy.sh "descrição"` — nunca `git push` direto. O script valida o build e usa o padrão de commit `vYYYY.MM.DD-HH.MM/descrição`.
- Sempre confirmar com o usuário antes de rodar o deploy, mesmo que o código já esteja pronto.
