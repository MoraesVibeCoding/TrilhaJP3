# Senha: trocar logado e recuperar pelo e-mail

Status: **aprovada pelo Pedro em 2026-11-24 ("De acordo").**

Decisões do Pedro em 2026-11-24:

- a troca de senha fica numa página **Conta** (`/conta`), aberta por um link na barra lateral, perto do Sair;
- trocar logado **pede a senha atual**;
- a tela Entrar ganha o link **Esqueci a senha**, que envia um e-mail. O link do e-mail abre a tela **Nova senha** no app.

Contexto: em 2026-11-24 os links de e-mail do Supabase levavam para `localhost`. O `site_url` do Auth de produção foi corrigido para `https://trilhajp3.vercel.app`, mas o app não tem rota que receba o link. O Pedro entrou com uma senha temporária definida pela API e precisa trocá-la.

Documentação oficial do Supabase consultada em 2026-11-24 (guia de autenticação no servidor com Next.js, exemplo `nextjs-user-management`): no SSR, o modelo de e-mail passa a mandar `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…`. A rota `app/auth/confirm/route.ts` troca o `token_hash` por uma sessão com `verifyOtp({ type, token_hash })`, grava a sessão em cookies e redireciona.

## 1. Requisitos funcionais

1. **Esqueci a senha (deslogado):**
   - a tela Entrar ganha o link "Esqueci a senha", que leva a `/entrar/esqueci`;
   - você digita o e-mail, e o servidor chama `resetPasswordForEmail`;
   - a resposta é sempre a mesma ("Se o e-mail estiver cadastrado, enviamos um link"), para não revelar quais e-mails existem;
   - o limite de envio é o do próprio Supabase Auth.
2. **Link do e-mail:**
   - `/auth/confirm` recebe `token_hash` e `type=recovery`, valida com `verifyOtp` e redireciona para `/nova-senha`;
   - um link vencido ou inválido volta para `/entrar`, com um aviso claro;
   - o redirecionamento só aceita caminho interno (`safeNext`, o mesmo do login).
3. **Nova senha (sessão de recuperação):** a tela pede a senha nova 2 vezes. Ela não pede a senha atual, porque quem chegou pelo link do e-mail não a sabe. Depois de trocar, a pessoa vai para a Retomar com o aviso "Senha trocada".
4. **Conta (logado):**
   - `/conta` mostra o e-mail e o formulário: senha atual, senha nova e confirmação;
   - o servidor confere a senha atual antes de trocar. A forma de conferir sai da documentação na fatia 1, e a preferência é o recurso nativo do Supabase de exigir a senha atual;
   - a senha atual errada mostra uma mensagem clara e não troca nada.
5. **Regras da senha:** mínimo de 12 caracteres, como o Auth já exige. A senha nova precisa ser igual nas 2 caixas e diferente da atual. Os erros aparecem ao lado do campo, sem apagar o que foi digitado.
6. **Modelo de e-mail "Reset password" do Supabase:** troca `{{ .ConfirmationURL }}` pelo link do item 2. A troca é feita em produção e no banco de teste, pela Management API ou por você no painel.

## 2. Requisitos não funcionais

1. **Segurança:**
   - `zod` na fronteira de cada ação;
   - a senha nunca aparece em log (a lista fechada do `logError` já impede);
   - a recuperação não revela se o e-mail existe;
   - a sessão de recuperação só serve para trocar a senha. Isso é conferido pelo método da sessão (`amr` do token), se a documentação confirmar; senão, por um cookie de curta duração gravado em `/auth/confirm`;
   - CSRF já coberto pelas Server Actions.
2. **Acessibilidade:** rótulos, erros em região viva, foco no primeiro campo com erro e axe nos dois temas.
3. **Marca e design:** as 3 telas seguem a tela Entrar e a casca atuais. As propostas passam pelo `impeccable` em HTML para você aprovar antes de construir, como manda o `CLAUDE.md`.
4. **Sem dependência nova** e sem migração de banco.

## 3. Fora do escopo

- Trocar o e-mail.
- Segundo fator (MFA).
- Magic Link para entrar. O login continua com senha; o modelo do Magic Link não muda.
- Cadastro de usuários novos.

## 4. Testes e critérios de aceitação

1. **Unitários:**
   - as ações validam a entrada;
   - a resposta do "esqueci" é igual para e-mail existente e inexistente;
   - `/auth/confirm` recusa token ausente ou inválido e só redireciona para caminho interno;
   - a senha atual errada não troca nada.
2. **Banco e Auth, no projeto de teste:** com um usuário fictício, trocar a senha logado exige a atual. Depois da troca, a senha antiga não entra e a nova entra.
3. **E2E:**
   - pela página Conta, trocar a senha e entrar de novo com a nova;
   - erros de senha curta, diferente na confirmação e atual errada;
   - o "esqueci" mostra a mensagem neutra;
   - a recuperação ponta a ponta com um link gerado pela API administrativa (`generateLink`), sem depender de e-mail de verdade;
   - axe nas 3 telas, nos dois temas.
4. Todas as checagens do `CONSTRAINTS.md`.

## 5. Fatias

1. Documentação: confirmar o recurso de senha atual e o `amr` da recuperação. Ações e rota `/auth/confirm`, com testes unitários. Cerca de 1h (estimativa).
2. 3 propostas em HTML (Conta, Esqueci e Nova senha) e a sua escolha. Cerca de 40 min.
3. As 3 telas, o link na barra lateral e no Entrar, e o E2E. Cerca de 1h20.
4. Os modelos de e-mail em produção e no teste, o deploy e a troca da sua senha temporária por você. Cerca de 20 min.
5. Revisão, `docs/STATUS.md` e PR. Cerca de 20 min.

Total estimado: cerca de 3h40.

## 6. Riscos

1. **Senha temporária:** ela passou por este ambiente em 2026-11-24 (o arquivo já foi apagado). Troque assim que a página Conta estiver no ar.
2. **CI ainda no banco de produção:** os segredos do GitHub ainda apontam para produção. O E2E desta tarefa cria e apaga usuários fictícios, então **troque os segredos (passo 3 da T14) antes do CI desta PR rodar**.
3. **Modelo de e-mail:** se ele não for trocado, o link volta para o fluxo antigo e não funciona. A fatia 4 confere o modelo com um envio real para você.
