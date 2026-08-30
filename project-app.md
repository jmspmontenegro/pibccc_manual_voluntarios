# Plano de Ação — Sistema de Voluntários (Start / PIBCCC)

## 1. Objetivo

Evoluir o atual "Manual do Voluntário" (site estático em `index.html`) para um **sistema web completo** de gestão do ministério infantil Start, mantendo:

- Deploy automático no Vercel a cada push na `main` (como já funciona hoje).
- Arquitetura **gratuita** (Vercel Hobby + banco de dados free tier).
- O manual continua acessível (público ou logado, a definir na Fase 5).

Novos recursos a construir: login/senha, cadastro de usuários, perfis de acesso, banco de horas, cadastro de eventos, inscrição em eventos, cadastro de crianças por evento.

## 2. Decisões de arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js** (App Router) | Permite SSR/SSG + API routes (serverless functions) no mesmo projeto, deploy nativo no Vercel, suporta o manual estático e o sistema logado juntos. |
| Banco de dados + Auth | **Supabase** (Postgres + Auth + Storage) | Pacote único gratuito: Postgres relacional (bom pra dados relacionados — usuários, eventos, inscrições, crianças), Auth pronto (email/senha), Storage pra fotos/documentos se precisar. |
| Hospedagem | **Vercel Hobby** (atual) | Já em uso, free, deploy automático via git push. |
| ORM | **Prisma** ou cliente `@supabase/supabase-js` direto | Prisma dá tipagem e migrations versionadas; decidir na Fase 0. |

### Limites do free tier (referência, ago/2026)

- **Vercel Hobby:** 100GB bandwidth/mês, funções serverless com limites de execução (10s hobby), sem cron pago necessário pro escopo aqui.
- **Supabase Free:** ~500MB banco Postgres, Auth com MAU generoso (bem acima de 200 usuários), projeto **pausa após 7 dias sem uso** (mitigar com algum ping ocasional ou aceitar reativação manual).

Com 50–200 voluntários estimados, ambos os free tiers são suficientes com folga. Ponto de atenção único: pausa por inatividade do Supabase — resolver com um cron leve (ex.: GitHub Actions ou Vercel Cron) fazendo um ping semanal, ou aceitar reativar manualmente quando necessário.

## 3. Perfis de acesso (roles)

| Perfil | Permissões |
|---|---|
| **Admin** | Acesso total: gerencia usuários, perfis, eventos, aprova banco de horas, vê tudo. |
| **Líder** | Cria/edita eventos, gerencia inscrições, lança/aprova horas da própria equipe, cadastra crianças. |
| **Voluntário** | Vê manual, se inscreve em eventos, registra próprias horas (pendente de aprovação), consulta seu histórico. |

Implementar via tabela `profiles` (extensão do usuário do Supabase Auth) com coluna `role`, e **Row Level Security (RLS)** no Postgres para cada tabela — regra de ouro: nunca confiar só na camada de front-end pra restringir acesso a dados sensíveis.

## 4. Modelo de dados (rascunho inicial)

```
profiles
  id (uuid, fk -> auth.users)
  nome, email, telefone
  role (admin | lider | voluntario)
  status (ativo | inativo)
  created_at

work_hours (banco de horas)
  id
  user_id (fk profiles)
  data
  quantidade_horas
  descricao / atividade
  evento_id (fk events, opcional)
  status (pendente | aprovado | rejeitado)
  aprovado_por (fk profiles, opcional)

events (eventos)
  id
  titulo, descricao
  data_inicio, data_fim
  local
  vagas_voluntarios
  status (planejado | aberto | encerrado)
  created_by (fk profiles)

event_registrations (inscrição de voluntários em eventos)
  id
  event_id (fk events)
  user_id (fk profiles)
  status (inscrito | confirmado | cancelado)
  created_at

children (cadastro de crianças)
  id
  nome, data_nascimento
  responsavel_nome, responsavel_telefone
  alergias / observacoes_saude
  autorizacao_imagem (bool)
  created_at

event_children (crianças por evento)
  id
  event_id (fk events)
  child_id (fk children)
  presente (bool)
  observacoes
```

> **Atenção LGPD:** dados de crianças (saúde, responsável, imagem) e dados pessoais de voluntários são sensíveis. Aplicar RLS restritiva (só admin/líder do evento acessam), evitar exportar/expor esses dados fora do sistema, e definir um responsável interno pelo tratamento desses dados antes de ir ao ar com essa parte.

## 5. Fases do projeto

### Fase 0 — Fundação (infra)
- Criar projeto Next.js, conectar ao repositório atual (ou novo branch), configurar deploy Vercel.
- Criar projeto Supabase, configurar variáveis de ambiente no Vercel.
- Definir Prisma (ou SDK direto) e rodar migration inicial (tabela `profiles`).
- Layout base (header, navegação, área pública vs. área logada).

### Fase 1 — Login, cadastro de usuários e perfis (prioridade confirmada)
- Tela de login/cadastro (Supabase Auth: email/senha).
- Criação automática de `profile` no primeiro login.
- Painel admin: listar usuários, editar perfil/role, ativar/inativar.
- Middleware de proteção de rotas por role.

### Fase 2 — Banco de horas (prioridade confirmada)
- Voluntário registra horas (data, atividade, quantidade).
- Líder/admin aprova ou rejeita.
- Relatório por voluntário/período (útil pra certificados, reconhecimento etc).

### Fase 3 — Cadastro de eventos + inscrições
- CRUD de eventos (líder/admin).
- Voluntário se inscreve em evento com vagas.
- Lista de inscritos por evento (líder vê e gerencia).

### Fase 4 — Cadastro de crianças por evento
- Cadastro/edição de crianças (ficha com responsável, alergias, autorização de imagem).
- Vincular crianças a um evento (lista de presença).
- Aplicar RLS restrita (dado sensível).

### Fase 5 — Unificar manual dentro do sistema
- Migrar conteúdo do `index.html` atual para páginas Next.js (estático, sem precisar login).
- Decidir: manual fica público ou só acessível logado.
- Manter geração de PDF já existente.

## 6. Estrutura de pastas (alvo, Next.js App Router)

```
/app
  /(public)/manual/...        -> conteúdo migrado do index.html
  /(auth)/login, /cadastro
  /(app)/dashboard
  /(app)/usuarios             -> admin
  /(app)/horas
  /(app)/eventos
  /(app)/eventos/[id]/inscritos
  /(app)/eventos/[id]/criancas
  /api/... (se precisar de rotas server-side além do client Supabase)
/lib/supabase.ts
/prisma/schema.prisma (se optar por Prisma)
```

## 7. Próximos passos imediatos

1. Confirmar: reaproveitar este repositório (convertendo pra Next.js) ou criar repositório novo e migrar depois.
2. Criar conta/projeto no Supabase e conectar credenciais ao Vercel (env vars).
3. Rodar `npx create-next-app` e validar deploy vazio no Vercel antes de migrar conteúdo.
4. Implementar Fase 0 + Fase 1 (fundação + login/perfis).
5. Validar com os líderes do ministério o fluxo de aprovação de horas antes de construir a Fase 2 (regra de negócio: quem aprova, prazo, etc.).

## 8. Riscos / pontos de atenção

- **Pausa do Supabase por inatividade** (free tier) — mitigar com ping periódico.
- **Dados sensíveis de crianças** — exige RLS bem definida e cuidado com LGPD antes de abrir cadastro.
- **Migração do conteúdo do manual** — trabalho manual de portar HTML/CSS pro Next.js sem perder formatação e função de PDF.
- **Escopo:** ordem sugerida evita construir tudo de uma vez — cada fase entrega algo utilizável sozinho.
