# STATUS — TrilhaJp3

Atualizado em 2026-10-26 (T12). Leia junto com `docs/SPEC.md` (aprovada, "DE ACORDO" do Pedro).

## Próxima ação

Pedro: instalar o app no iPad para conferir o ícone e a tela cheia (o endereço precisa ser HTTPS público: porta 3000 do Codespace como Public, ou a Vercel) e cadastrar as variáveis do Supabase no ambiente de nuvem. Eu: T2 e T5 assim que uma sessão nova tiver as variáveis; até lá, barra lateral recolhível ou T7.

## Repositório e ambiente (2026-10-26)

O trabalho continua no repositório público `MoraesVibeCoding/TrilhaJP3`, criado em 2026-10-26 com um commit único: o Actions de repositório privado tinha esgotado a cota de minutos, e o público não tem limite. Antes de publicar, telefone, e-mail e o endereço do projeto Supabase foram trocados por dados fictícios. O histórico completo, com os dados reais, fica no repositório privado `MoraesVibeCoding/GrupoPmVibeCoding` (PR #2), que vira arquivo. Sessões de nuvem usam `.claude/hooks/session-start.sh`: instala dependências, gitleaks, osv-scanner e semgrep, aponta o E2E para o Chromium do ambiente e busca `origin/main`.

## Aprovado em 2026-10-22

1. Layout: proposta B (mesa dividida), entrada **Retomar**, página **Demandas** com visões (Tabela, Por projeto, Quadro), demanda em janela com fundo fosco.
2. 5 releases (`docs/PROPOSTA-SISTEMA.md`) e 3 acréscimos na R1: página inteira com link, captura rápida, barra lateral recolhível.
3. Propostas 1 a 5 de `docs/PRINCIPIOS-OBJETIVOS.md` (Agora, estimativa, Feito hoje, Foco/Completo, aviso de excesso). Interruptor Foco/Completo na R1 (`docs/PRINCIPIOS-OBJETIVOS.md` 5b).
4. Supabase: a chave funcionava na sessão de 2026-10-22; no ambiente atual as variáveis não chegam (ver Pendências).

## Adiado

Integração com n8n (campo Executor, GitHub issue com `@claude`): adiada a pedido do Pedro em 2026-10-22. Para retomar: host da instância n8n, chave de API como segredo de rede, sessão nova. `npx @n8n/cli workflow list` já roda; falta só `N8N_URL` e a chave. Decisões 1, 2 e 4 da Q14 continuam abertas.

## Ideias fora da tarefa atual

Ver `docs/PRINCIPIOS-OBJETIVOS.md`, seção 5.

## Em uma frase

TrilhaJp3 é o sistema de gestão da Moraes CodeVibe. A v1 é o módulo Projetos e demandas. A T0 (base, Prettier, CI, Playwright) e a T1-R (casca, Retomar, janela da demanda, interruptor Foco/Completo, revisão final do `impeccable`) estão prontas. A T6a (Demandas em Tabela, versão A, com dados de demonstração) está pronta. A T6b (Por projeto, cartões) também. A T6c (Quadro, menu Mover para) também. A T6d (captura rápida, janela) também. A T5b (demanda em página inteira, `/demandas/[id]`, proposta A em três colunas; a janela troca o endereço e as alterações ficam no navegador) está pronta, com revisão final do `impeccable`. As próximas são a T5 e a T2 (regras de acesso por empresa no Supabase), que esperam as variáveis do Supabase.

## Decisões fechadas (resumo)

1. Uso: só o Pedro na v1, login obrigatório, banco multiempresa desde o início (RLS por `organization_id`).
2. Escopo da v1: projetos, demandas (a fazer, fazendo, feito), subtarefas de um nível, etiquetas, comentários, histórico por gatilhos no banco, anexos (imagens, PDF, documentos de escritório, até 10 MB, executáveis bloqueados).
3. Stack: Next.js 16, TypeScript, Supabase (Postgres, Auth, Storage), Vercel, Vitest, Playwright. Interface em pt-BR, PWA.
4. Nome do app: TrilhaJp3. Empresa: Moraes CodeVibe. Domínio `trilhajp3.com` (compra pendente, segundo o Pedro). A v1 começa no endereço padrão da Vercel.
5. D1 e D2: desenvolver nos planos gratuitos e migrar para Vercel Pro e Supabase Pro antes de entrar qualquer dado real da empresa.
6. Varredura de segredos: recurso nativo do GitHub, não o gitleaks (exige licença para organização).
7. Design: toda decisão de design e layout passa pela skill `impeccable`, usando o kit de marca em `docs/brand/`.

## Estado do código (branch `claude/elegant-turing-h68599`, sem PR)

| Item | Estado |
|---|---|
| Next.js 16 + TypeScript estrito + ESLint | Pronto |
| Vitest (1 teste de fumaça) | Pronto, verde |
| Prettier (`format`, `format:check`) | Pronto, verde |
| Playwright E2E (1 teste de fumaça) | Pronto, verde |
| CI no GitHub Actions (formatação, lint, tipos, teste, build, E2E) | Verde nas execuções #1 e #2 |
| `.gitattributes` com `eol=lf` | Commit `60970dc`, a execução #3 do CI ainda não foi conferida |
| Supabase (esquema, RLS, login) | Não iniciado |

Comandos: `npm test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`.

## Pendências

1. **Supabase de teste:** projeto `https://exemplo.supabase.co`. As variáveis não chegam ao ambiente de nuvem atual (nenhuma `SUPABASE_*`). Cadastrar de novo nas configurações do ambiente; só uma sessão nova as lê. A chave de serviço nunca vai para o repositório nem para variável `NEXT_PUBLIC_`.
2. **Migrações (T2):** alterar o banco exige uma credencial extra (token de acesso do Supabase), a cadastrar junto com as variáveis acima.
3. **Docker:** o ambiente de nuvem não tem daemon do Docker, então o Supabase local não sobe lá. Os testes de RLS usam o projeto Supabase de teste.
4. **Marca:** o pedido de registro no INPI ainda não foi feito. O Pedro disse que fará.
5. `npm audit --audit-level=high`: 0 vulnerabilidades em 2026-10-26 (os 5 alertas antigos do ESLint sumiram).

## Notas de ambiente

1. Computador do Pedro (Windows): Node 24.20, npm 11. O CI e a nuvem usam Node 22. Tudo passa nos dois. Ideia pendente: fixar `engines` no `package.json`.
2. Identidade do Git configurada só no repositório local: Pedro Moraes, `contato@exemplo.com.br`.
3. A skill `impeccable` está em `.claude/skills/impeccable/`. O launcher `scripts/impeccable` baixa um binário na primeira execução e precisa de aprovação do Pedro.
4. **Decisão do Pedro em 2026-10-23 (R4): manter os hooks do `impeccable`** em `.claude/settings.local.json` (local, ignorado pelo Git). Eles rodam o detector depois de editar arquivos de interface. A decisão antiga de não instalá-los fica revogada.

## Próximos passos, nesta ordem

1. T1: rodar `/impeccable init` para criar `PRODUCT.md` e `DESIGN.md` a partir do kit em `docs/brand/`, aplicar tokens `--mcv-*` e a tipografia (Geist, por decisão do Pedro em 2026-10-22), casca do app em claro e escuro. Concluído.
2. T2: esquema inicial (empresas, vínculos, RLS) com teste de isolamento entre duas empresas contra o Supabase de teste.
3. T3 em diante, conforme o plano da seção 6 da spec.

Regra de trabalho: Red-Green-Refactor, commits pequenos, nenhuma tarefa concluída sem o log dos testes passando.
