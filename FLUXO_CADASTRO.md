# Fluxo de cadastro + aprovação de voluntário

Referência de escopo pro ponto 3 do pedido do usuário (2026-09-08, ver cards
do Trello). Se o fluxo mudar durante a implementação, atualizar este arquivo
junto.

```mermaid
flowchart TD
    A["Usuário abre /cadastro\n(link na tela de login)"] --> B["Preenche dados\n(nome, e-mail, telefone,\nnascimento, sala preferencial, senha)"]
    B --> C["Aceita o Termo de Voluntariado\n(TermGate, primeiro acesso)"]
    C --> D["supabase.auth.signUp()\nprofiles nasce com status = pending\n(trigger handle_new_user)"]
    D --> E["Tela mostra alerta:\n'Cadastro solicitado! Confira seu\ne-mail e confirme antes de logar.'"]
    D --> F["Supabase manda e-mail de confirmação\n(template com a marca do app)"]
    D --> G["Trigger/webhook dispara notificação\npra admin + coordinator"]

    F --> H["Usuário clica no link do e-mail"]
    H --> I["/auth/confirm troca o token pela sessão\n(verifyOtp) e IMEDIATAMENTE desloga\n(status ainda é pending)"]
    I --> J["Redireciona pro /login com mensagem\nde sucesso: 'E-mail confirmado!\nAguardando aprovação da coordenação.'"]

    G --> K["E-mail pra admin/coordinator:\ndados do novo usuário + link\npra tela de edição dele"]
    K --> L{"Quem recebe o e-mail\nestá logado?"}
    L -- não --> M["/login?redirect=/admin/usuarios?...\nApós logar, vai direto pra lá"]
    L -- sim --> N["Abre direto a tela/edição\ndo usuário pendente"]
    K -.-> O["Ou navega manualmente\naté /admin/usuarios"]

    M --> P["Tela do usuário: botão verde\n'Aprovar' (só aparece se status = pending)"]
    N --> P
    O --> P

    P --> Q["approveUser(): status = approved"]
    Q --> R["E-mail pro usuário:\n'Seu acesso foi liberado!'"]
    Q --> S["Usuário já consegue logar normalmente\n(login() já checa status = approved)"]
```

## Decisões de implementação

- **Confirmação de e-mail cria uma sessão momentânea** (é assim que o Supabase
  Auth funciona — `verifyOtp`/exchange do link seta cookies de sessão). Como
  `status` só é checado dentro de `login()` (`app/auth/actions.ts`), e não no
  `app/(app)/layout.tsx`, a rota de callback (`/auth/confirm`) precisa
  **deslogar explicitamente** logo depois de confirmar, antes de redirecionar
  — senão um usuário `pending` ficaria com sessão válida e acessaria o app
  sem estar aprovado. Isso replica o mesmo padrão que `login()` já usa pra
  status `pending`/`blocked` (sign out + mensagem).
- **Notificação de admin/coordenação** e **e-mail de aprovação pro usuário**
  usam Resend (provisionado via Vercel Marketplace, ver AGENTS.md). Domínio
  de envio (`impulsion.com.br`) ainda precisa verificar DNS no Resend — até
  lá, o envio falha (403), mas isso não trava o cadastro/aprovação em si
  (`lib/email.ts` nunca lança, só loga o erro). Implementado como chamada
  direta de dentro das Server Actions/Route Handler (`app/auth/notify-new-signup.ts`,
  `approveUser()`), sem Edge Function nem DB webhook — mais simples que o
  desenho original cogitava, já que o próprio Next.js já roda server-side
  no momento certo (confirmação de e-mail, aprovação).
- **Link de aprovação** aponta pra tela de usuários com um jeito de já abrir
  o registro certo (querystring `?highlight=<id>` ou rota própria — decidir
  na implementação da task "Deep link do e-mail pra tela do usuário").
- **Redirect pós-login** precisa validar que a URL de destino é interna
  (mesma origem), nunca redirecionar pra domínio externo vindo de query
  param sem validar (proteção contra open redirect).
