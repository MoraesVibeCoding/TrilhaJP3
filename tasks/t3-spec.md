# T3: Login e sessão

Status: **rascunho, aguardando aprovação do Pedro.** Nenhum código foi escrito e nenhuma configuração do Supabase foi alterada. Base: `docs/SPEC.md` (seções 4.1 e 4.3), ADR 0003, `tasks/t2-spec.md`, `CONSTRAINTS.md`.

## 1. Objetivo

Só quem fez login entra no TrilhaJp3. O Pedro entra com a conta dele e cai no Retomar; sem login, qualquer endereço do app leva à tela de entrada. A sessão fica em cookies, renovada no servidor, e o app sabe a que empresa o usuário pertence (base para a T4 e a T5 lerem dados reais com a RLS da T2).

## 2. Fatos verificados em 2026-10-26

1. **Next 16** (`node_modules/next/dist/docs/`): o arquivo `middleware` virou `proxy` (`src/proxy.ts`). O guia de autenticação recomenda o Proxy só para checagens otimistas e uma camada de acesso a dados (DAL) perto dos dados. Para rotas estáticas, a proteção é o Proxy. Com `cacheComponents: true` (ligado em `next.config.ts`), ler cookies fora de `<Suspense>` quebra o build, e ler a sessão no topo de um layout segura a página inteira.
2. **`@supabase/ssr`** (guia oficial `creating-a-client.mdx`, lido pela fonte no GitHub): o Proxy renova o token chamando `supabase.auth.getClaims()` e devolve a resposta que o `setAll` montou, com os cabeçalhos `Cache-Control`, `Expires` e `Pragma` (sem eles, uma CDN pode guardar a sessão de um usuário e servir a outro). **Nunca** confiar em `getSession()` no servidor: ele não revalida o cookie. Versão atual: 0.12.7 (MIT), pede `@supabase/supabase-js` ^2.114.0 (temos 2.118.0).
3. **Configuração de Auth do projeto de teste** (leitura pela Management API):
   - `disable_signup = false`: **qualquer pessoa com a chave pública cria conta.** A RLS da T2 impede essa conta de ver dados, mas a porta está aberta.
   - Senha mínima de 6 caracteres; verificação de senhas vazadas desligada.
   - Sem SMTP próprio: o envio de e-mail do Supabase é limitado (`rate_limit_email_sent = 2` por hora).
   - `site_url = http://localhost:3000`, sem endereços de retorno cadastrados.
   - Rotação de refresh token ligada; token de acesso dura 1 hora.
   - Nenhum usuário cadastrado.
4. **App hoje:** `AppShell` envolve tudo no `src/app/layout.tsx`. Uma tela de entrada dentro da casca mostraria a navegação para quem não entrou. As páginas usam dados de demonstração e o navegador (`localStorage`); nada lê o Supabase ainda.

## 3. Requisitos funcionais

1. **Tela de entrada** em `/entrar`, fora da casca: e-mail, senha, botão Entrar. Erro genérico ("E-mail ou senha incorretos"), sem dizer qual dos dois errou nem se o e-mail existe. 🎨 Passa pelo `impeccable` (3 propostas, escolha do Pedro, revisão final).
2. **Proteção de rotas** por `src/proxy.ts`: sem sessão válida (`getClaims()`), qualquer rota do app redireciona para `/entrar?de=<rota>`. Depois do login, volta para `de` (só caminhos internos começando com `/`, para não virar redirecionamento aberto); sem `de`, vai para `/`. Quem já está logado e abre `/entrar` vai para `/`. Ficam de fora do Proxy os arquivos estáticos, os ícones e o `manifest.webmanifest` (o PWA precisa deles sem login).
3. **Camada de acesso** `src/lib/auth.ts` (`server-only`): `getCurrentUser()` lê os claims verificados e devolve `{ id, email, organizationId }`; sem sessão ou sem vínculo, redireciona para `/entrar`. É a única porta para saber quem está logado; T4 em diante a chamam nas ações do servidor.
4. **Sair:** ação no cabeçalho da casca (Server Action com `signOut()`), volta para `/entrar`.
5. **Login e saída como Server Actions** com `useActionState`, validação de entrada no servidor com `zod` (e-mail válido, senha não vazia, tamanhos máximos).
6. **Estrutura:** as páginas atuais vão para um grupo de rotas `src/app/(app)/` com o `AppShell` no layout do grupo; `/entrar` fica fora. Os endereços não mudam.
7. **Usuário do Pedro e empresa:** a empresa Moraes CodeVibe e o vínculo `owner` do Pedro entram por migração depois que o usuário existir (ver decisão 3).

## 4. Configuração do Supabase (muda o projeto de teste, só depois da aprovação)

1. Fechar o cadastro público: `disable_signup = true`. Contas novas só pelo painel ou pela chave de serviço.
2. Senha mínima de 12 caracteres.
3. `site_url` continua `http://localhost:3000` até a Vercel (T14).

Feitas pela Management API (`PATCH /v1/projects/{ref}/config/auth`), registradas em `docs/STATUS.md`. Reversíveis pelo mesmo caminho.

## 5. Testes e critérios de aceitação

1. **Unitários (Vitest):** validação do formulário (e-mail, senha, tamanhos); o destino de `de` aceita só caminho interno (`/demandas` sim; `//evil.com`, `https://evil.com`, `/\evil.com` não).
2. **Integração (`npm run test:db`):** com a configuração do item 4, criar conta pela chave pública falha; login com senha errada falha com mensagem genérica; usuário logado lê só a própria empresa (já coberto pela T2, reaproveitado).
3. **E2E (Playwright) contra o Supabase de teste**, com um usuário fictício criado e apagado pelo teste:
   - sem login, `/`, `/demandas` e `/demandas/<id>` levam a `/entrar`;
   - `manifest.webmanifest` e os ícones respondem 200 sem login;
   - login certo leva ao Retomar; login com `de=/demandas` volta para `/demandas`;
   - senha errada mostra o erro genérico e não entra;
   - Sair leva a `/entrar`, e voltar no navegador não mostra a página protegida;
   - a resposta do Proxy com cookie novo traz `Cache-Control` sem cache.
4. **Acessibilidade:** `/entrar` entra no `e2e/accessibility.spec.ts` (claro e escuro); teclado, foco visível, rótulos e mensagem de erro anunciada (`aria-live`).
5. Todas as checagens do `CONSTRAINTS.md` verdes (`npm run check:task`, E2E e o CI). Os E2E atuais continuam verdes, agora logados.

Antes de fechar: `doubt-driven-development` (auth é alto risco, `tasks/plan.md` regra 4), revisão OWASP de acesso e sessão (Checkpoint 2) e revisão em 5 eixos.

## 6. Fora do escopo

Recuperar senha por e-mail (sem SMTP próprio; o Pedro redefine pelo painel), cadastro pelo app, convites, troca de empresa, login social, MFA (o projeto já permite TOTP; fica para a T13), dados reais nas páginas (T4 e T5), domínio e Vercel (T14).

## 7. Riscos

1. **Cadastro aberto até a configuração do item 4.1:** hoje qualquer um cria conta. Não vê dados (RLS), mas ocupa o banco e abre caminho para abuso. Mitigação: primeira ação depois da aprovação.
2. **E2E dependem do Supabase de teste e da rede:** o CI já tem os segredos (T2). O projeto gratuito pausa com pouca atividade (D2).
3. **Redirecionamento aberto pelo `de`:** coberto pelo teste unitário do item 5.1.
4. **Sessão em cache de CDN:** cabeçalhos do `setAll` aplicados e testados (item 5.3).
5. **Mudança de estrutura (`(app)/`):** move arquivos; os testes atuais garantem que nada muda para o usuário.

## 8. Decisões abertas (uma de cada vez)

1. **Forma de entrar. Decidido pelo Pedro em 2026-10-26: e-mail e senha** (não depende de e-mail enviado; o limite de 2 e-mails por hora não atrapalha). Alternativa: link mágico por e-mail (sem senha, mas cada entrada gasta um e-mail do limite e exige configurar endereços de retorno).
2. **Configuração do item 4** (cadastro fechado, senha de 12). **Decidido pelo Pedro em 2026-10-26: aplicar**, depois da aprovação da spec.
3. **Criação do usuário do Pedro.** Recomendação: o Pedro cria pelo painel (Authentication, Add user, com "Auto Confirm User"), assim a senha nunca passa pelo chat nem pelo repositório; eu crio a empresa e o vínculo por migração, achando o usuário pelo e-mail. Alternativa: eu crio com a chave de serviço e uma senha temporária que o Pedro troca, mas a senha passaria pelo chat.

## 9. Tarefas depois da aprovação

1. Configuração do item 4; teste de integração (cadastro negado).
2. Instalar `@supabase/ssr` e `zod`; clientes do servidor e do navegador; `src/proxy.ts` com renovação de sessão e redirecionamento; testes do `de`.
3. 🎨 Tela `/entrar`: 3 propostas via `impeccable`, escolha do Pedro.
4. Construir `/entrar`, ações de entrar e sair, grupo `(app)/`, `getCurrentUser()`; E2E do item 5.3 e acessibilidade.
5. Migração da empresa Moraes CodeVibe e do vínculo do Pedro (depois de o usuário existir).
6. `doubt-driven-development`, revisão OWASP e em 5 eixos, `npm run check:full`, `docs/STATUS.md`.
