# STATUS — TrilhaJp3

Atualizado em 2026-10-30 (troca de marca mesclada, PR #9; spec da T7 aguarda aprovação). Leia junto com `docs/SPEC.md` (aprovada, "DE ACORDO" do Pedro).

## Próxima ação

Pedro: revisar e aprovar a spec da T7 (subtarefas), `tasks/t7-spec.md`, na branch `claude/t7-spec`. A troca de marca foi mesclada (PR #9, `check:floor` vermelho aceito pelo Pedro).

## Marca (2026-10-27)

A empresa passou a se chamar **Moraes Coding** (direção visual B · Gráfico: Mata, Gelo, Sinal laranja; Space Grotesk e IBM Plex Mono; M em barras). A troca no app foi mesclada em 2026-10-30, PR #9 (ADR 0007, `tasks/marca-spec.md`), com a casca na proposta A (barra lateral em Mata), escolhida pelo Pedro em 2026-10-28. Fonte: design system "Moraes Coding" no claude.ai; no repositório só entram tokens e SVGs (`docs/brand/moraes-coding/`), porque o manual traz o nome completo do Pedro. A empresa no banco de teste já se chama Moraes Coding (migração `20261029120000_moraes_coding`, reversível). Na mesma branch, a pedido do Pedro: os ícones de interface da marca (componente `Icon`) e os tokens renomeados para os nomes semânticos da marca (`--mc-*`).

## Repositório e ambiente (2026-10-26)

O trabalho continua no repositório público `MoraesVibeCoding/TrilhaJP3`, criado em 2026-10-26 com um commit único: o Actions de repositório privado tinha esgotado a cota de minutos, e o público não tem limite. Antes de publicar, telefone, e-mail e o endereço do projeto Supabase foram trocados por dados fictícios. O histórico completo, com os dados reais, fica no repositório privado `MoraesVibeCoding/GrupoPmVibeCoding` (PR #2), que vira arquivo. Sessões de nuvem usam `.claude/hooks/session-start.sh`: instala dependências, gitleaks, osv-scanner e semgrep, aponta o E2E para o Chromium do ambiente e busca `origin/main`.

## Aprovado em 2026-10-22

1. Layout: proposta B (mesa dividida), entrada **Retomar**, página **Demandas** com visões (Tabela, Por projeto, Quadro), demanda em janela com fundo fosco.
2. 5 releases (`docs/PROPOSTA-SISTEMA.md`) e 3 acréscimos na R1: página inteira com link, captura rápida, barra lateral recolhível.
3. Propostas 1 a 5 de `docs/PRINCIPIOS-OBJETIVOS.md` (Agora, estimativa, Feito hoje, Foco/Completo, aviso de excesso). Interruptor Foco/Completo na R1 (`docs/PRINCIPIOS-OBJETIVOS.md` 5b).
4. Supabase: as 4 variáveis chegam ao ambiente de nuvem e foram validadas em 2026-10-26 (ver Pendências, item 1).

## Adiado

Integração com n8n (campo Executor, GitHub issue com `@claude`): adiada a pedido do Pedro em 2026-10-22. Para retomar: host da instância n8n, chave de API como segredo de rede, sessão nova. `npx @n8n/cli workflow list` já roda; falta só `N8N_URL` e a chave. Decisões 1, 2 e 4 da Q14 continuam abertas.

## Ideias fora da tarefa atual

Ver `docs/PRINCIPIOS-OBJETIVOS.md`, seção 5.

## Em uma frase

TrilhaJp3 é o sistema de gestão da empresa (Moraes Coding). A v1 é o módulo Projetos e demandas. Prontas e em `main`: T0, T1-R, T2 (empresas e RLS), T3 (login), T4 (projetos), T12 (PWA) e as telas da T5b e T6a a T6d. A T5 (demandas reais) está em `main` (PR #5). A troca de marca para Moraes Coding está em `main` (PR #9). Próximas: T7 (subtarefas), T8 a T11, T13, T14.

## Decisões fechadas (resumo)

1. Uso: só o Pedro na v1, login obrigatório, banco multiempresa desde o início (RLS por `organization_id`).
2. Escopo da v1: projetos, demandas (a fazer, fazendo, feito), subtarefas de um nível, etiquetas, comentários, histórico por gatilhos no banco, anexos (imagens, PDF, documentos de escritório, até 10 MB, executáveis bloqueados).
3. Stack: Next.js 16, TypeScript, Supabase (Postgres, Auth, Storage), Vercel, Vitest, Playwright. Interface em pt-BR, PWA.
4. Nome do app: TrilhaJp3. Empresa: Moraes CodeVibe. Domínio `trilhajp3.com` (compra pendente, segundo o Pedro). A v1 começa no endereço padrão da Vercel.
5. D1 e D2: desenvolver nos planos gratuitos e migrar para Vercel Pro e Supabase Pro antes de entrar qualquer dado real da empresa.
6. Varredura de segredos: recurso nativo do GitHub, não o gitleaks (exige licença para organização).
7. Design: toda decisão de design e layout passa pela skill `impeccable`, usando o kit de marca em `docs/brand/`.

## Estado do código (2026-10-29)

| Item | Estado |
|---|---|
| Base (Next.js 16, TS estrito, ESLint, Prettier, Vitest, Playwright, CI) | Pronto |
| Supabase: empresas, vínculos e RLS (T2) | Pronto |
| Login e sessão (T3) | Pronto |
| Projetos (T4) | Pronto, em `main` (PR #4) |
| Demandas reais (T5) | Pronto, em `main` (PR #5) |
| Marca Moraes Coding | Pronto, em `main` (PR #9); 333 testes unitários, E2E 117, banco 29, build, gitleaks, osv-scanner, semgrep e npm audit limpos (2026-10-30) |
| CI | `check:floor` vermelho por asserções reescritas (aceito pelo Pedro na T4 e na T5); o resto verificado localmente |

Comandos: `npm run db:migrate` (aplica `supabase/migrations/` pela Management API; `--rollback <versão>` reverte), `npm run test:db`, `npm test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`.

## Pendências

1. **Supabase de teste: resolvido em 2026-10-26.** As 4 variáveis chegam ao ambiente de nuvem e respondem: `NEXT_PUBLIC_SUPABASE_URL` (`/auth/v1/health` 200), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave `sb_publishable_`, `/auth/v1/settings` 200, rota admin 401 como esperado), `SUPABASE_SERVICE_ROLE_KEY` (chave `sb_secret_`, `/auth/v1/admin/users` 200), `SUPABASE_ACCESS_TOKEN` (`sbp_`, projeto `ACTIVE_HEALTHY`). As chaves são do formato novo, não JWT: a secreta vai no cabeçalho `apikey`. A chave de serviço nunca vai para o repositório nem para variável `NEXT_PUBLIC_`. Banco vazio nessa data (nenhuma tabela em `public`, nenhum usuário).
2. **Migrações (T2): resolvido em 2026-10-26.** O token de acesso roda SQL como `postgres` pela Management API (`POST /v1/projects/{ref}/database/query`). A conexão direta ao Postgres (portas 5432 e 6543) não resolve no ambiente de nuvem, então `supabase db push` e `supabase test db` não rodam aqui. Ver `tasks/t2-spec.md`.
3. **Auth do projeto de teste (T3), 2026-10-26:** cadastro público fechado (`disable_signup = true`) e senha mínima de 12, pela Management API (`PATCH /v1/projects/{ref}/config/auth`); a rota pública `/auth/v1/settings` levou menos de 1 minuto para refletir. Reverter pelo mesmo caminho. Usuário do Pedro criado por ele no painel (1 usuário, confirmado).
4. **Empresa e dono (T3), 2026-10-26:** a migração `20261026190000_moraes_codevibe` cria a empresa Moraes CodeVibe (id `5d35ad87-c91e-4d87-a95a-11d421149f19`). O vínculo `owner` do Pedro **não está no repositório** (o repositório é público e o e-mail não entra nele): foi criado por consulta avulsa pela Management API, achando o usuário pelo e-mail. **Repetir em produção (T14)** depois de o Pedro criar o usuário lá: `insert into public.memberships (organization_id, user_id, role) select '5d35ad87-c91e-4d87-a95a-11d421149f19', id, 'owner' from auth.users where lower(email) = '<e-mail do Pedro>' on conflict do nothing;`. O teste `supabase/tests/company.test.ts` confere que a empresa existe com exatamente um dono.
5. **Docker:** o ambiente de nuvem não tem daemon do Docker, então o Supabase local não sobe lá. Os testes de RLS usam o projeto Supabase de teste.
6. **Marca:** o pedido de registro no INPI ainda não foi feito. O Pedro disse que fará.
7. `npm audit --audit-level=high`: 0 vulnerabilidades em 2026-10-26 (os 5 alertas antigos do ESLint sumiram).

## Notas de ambiente

1. Computador do Pedro (Windows): Node 24.22, npm 11, Git 2.56. O CI e a nuvem usam Node 22. Tudo passa nos dois. Ideia pendente: fixar `engines` no `package.json`. Projeto em `C:\Users\pedro\Documents\TrilhaJP3` (clonado em 2026-10-27). No PowerShell: usar `npm.cmd` (a política de scripts bloqueia o `npm.ps1`); o Git foi posto no PATH do usuário à mão (`C:\Program Files\Git\cmd`). O `.env.local` sai do `.env.example`; criar com `Set-Content -Encoding ascii` (o `utf8` do Windows PowerShell põe um BOM que esconde a primeira variável). Sem o arquivo, o Proxy falha com "Your project's URL and Key are required".
2. Identidade do Git configurada só no repositório local: Pedro Moraes, `contato@exemplo.com.br`.
3. A skill `impeccable` está em `.claude/skills/impeccable/`. O launcher `scripts/impeccable` baixa um binário na primeira execução e precisa de aprovação do Pedro.
4. **Decisão do Pedro em 2026-10-23 (R4): manter os hooks do `impeccable`** em `.claude/settings.local.json` (local, ignorado pelo Git). Eles rodam o detector depois de editar arquivos de interface. A decisão antiga de não instalá-los fica revogada.

## Próximos passos, nesta ordem

1. T1: rodar `/impeccable init` para criar `PRODUCT.md` e `DESIGN.md` a partir do kit em `docs/brand/`, aplicar tokens `--mcv-*` e a tipografia (Geist, por decisão do Pedro em 2026-10-22), casca do app em claro e escuro. Concluído.
2. T2: esquema inicial (empresas, vínculos, RLS) com teste de isolamento entre duas empresas contra o Supabase de teste. Concluído em 2026-10-26.
3. T3 em diante, conforme o plano da seção 6 da spec.

Regra de trabalho: Red-Green-Refactor, commits pequenos, nenhuma tarefa concluída sem o log dos testes passando.
