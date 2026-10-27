# STATUS REPORT: Raio-X do TrilhaJp3

Data: 2026-10-27. Auditoria somente leitura; este é o único arquivo escrito. Branch auditada: `claude/t5-spec` (`d7b0fea`), árvore limpa.

## 1. Resumo executivo

O TrilhaJp3 é o sistema de gestão da Moraes CodeVibe; a v1 é o módulo Projetos e demandas (`docs/SPEC.md`, `tasks/plan.md`). Stack: Next.js 16 (App Router, Server Actions, `cacheComponents`), React 19, TypeScript estrito, Supabase (Postgres com RLS e Auth), `zod`, Vitest, Playwright, CI no GitHub Actions. Sem backend separado: a lógica de servidor são Server Actions e o Proxy do Next.

**Conclusão estimada da v1: cerca de 55%.**

- Fundação, login, isolamento por empresa, PWA e projetos estão prontos.
- As demandas estão no meio da migração de dados de demonstração para dados reais (T5, 3 de 4 fatias).
- Faltam subtarefas completas, etiquetas, comentários, histórico, anexos, endurecimento e produção. São 7 das 19 tarefas do plano, entre elas as de maior risco (histórico por gatilhos e anexos).

A estimativa conta tarefas do plano com peso pelo tamanho (S, M); não é medida de linhas de código.

**Saúde técnica (medida nesta auditoria):**
- `npm run typecheck`: sem erros.
- `npm run lint`: sem erros.
- `vitest`: 300 de 300 testes passando, em 50 arquivos.
- `npm audit --audit-level=high`: 0 vulnerabilidades.
- `check:floor`: **65 violações**, que bloqueiam o CI (seção 4).
- O E2E (110 de 110) e os testes de banco (29 da T5) passaram nesta sessão de trabalho, antes da auditoria. Não rodei de novo porque gravam no Supabase de teste.

## 2. Últimas movimentações (Git)

- **Branches:**
  - `main` contém só T12 (PWA), T2 (empresas e RLS) e T3 (login), em 3 commits sobre o commit inicial.
  - `claude/t4-spec` é a **PR #4, aberta e não mesclada** (T4 Projetos e kit de marca V2).
  - `claude/t5-spec`, a branch ativa, foi criada **em cima da T4** e está 17 commits à frente de `main`. Não tem PR.
- **Últimos 5 commits:**
  1. `d7b0fea` captura rápida grava no banco.
  2. `c8e15df` mover, Agora e Concluir passo gravam no banco.
  3. `c479316` subtarefas reais e E2E sobre dados semeados.
  4. `06c2d74` Retomar e Demandas leem demandas reais.
  5. `486c039` tabela `tasks` com RLS.
- **Trabalho interrompido:** a T5.3 (escrita) está na metade. Faltam editar título, descrição, prioridade e prazo, e importar as demandas capturadas no navegador. As 3 propostas de design (A, B, C) aguardam a escolha do Pedro. A T5.4 (limpeza, revisões, PR) não começou.
- Não há stash nem alterações pendentes.

## 3. Mapa de módulos

### 🟢 Concluído (interface, lógica, banco e erros)

| Módulo | Evidência |
|---|---|
| Fundação | Next 16, TS estrito, ESLint, Prettier, Vitest, Playwright, CI com 2 jobs (`check`, `db`), `CONSTRAINTS.md` e guarda do piso |
| Empresas e isolamento (T2) | `organizations`, `memberships`, `private.is_member`; RLS em todas as tabelas; testes de isolamento entre duas empresas (`supabase/tests/rls.test.ts`) |
| Login e sessão (T3) | `/entrar`, Proxy com `getClaims()`, `getCurrentUser()`, Sair, cadastro público fechado, senha mínima de 12; redirecionamento seguro (`safeNext`) |
| PWA (T12) | `manifest.ts`, ícones, instalável |
| Projetos (T4) | `/projetos`: criar, editar, arquivar e restaurar com `zod` e Server Actions; RLS e grants por coluna. **Pronto na branch, mas não está em `main`** (PR #4 aberta) |
| Leitura das demandas (T5.2) | Retomar, Demandas (Tabela, Por projeto, Quadro), janela e `/demandas/[id]` leem `tasks` do Supabase; subtarefas reais (demandas filhas) |
| Ações de demanda (T5.3, parte) | Mover de estado, marcar e tirar de Agora (uma por empresa, índice único), Concluir passo e captura rápida gravam no banco; tela otimista que volta e avisa se falhar |

### 🟡 Parcial ou com resto de demonstração

| Módulo | O que falta |
|---|---|
| Demandas (T5) | Editar título, descrição, prioridade e prazo (nenhuma tela mostra descrição nem prazo); importar as demandas capturadas no navegador; apagar `demo-data.ts`, `use-captured.ts` e o resto do atalho do navegador; revisões e PR |
| Demandas capturadas antes da T5 | `useWithCaptured` ainda mistura as demandas do `localStorage` (ids `c-…`) com as do banco. Mover, marcar Agora ou concluir uma delas **falha e mostra "Não foi possível salvar"**, porque o id não é uuid. Some com a importação (T5.3) |
| Subtarefas (T7) | Leitura e Concluir passo funcionam; criar, renomear e reordenar não existem; o banco ainda não impede filha de outra empresa (sem grant de `parent_task_id` para o cliente, então hoje não é explorável) |
| Comentários, anexos e histórico na tela | Grupos aparecem vazios ("Nenhum comentário.") por decisão da spec; sem dados nem tabelas |

### 🔴 Faltando

| Módulo | Situação |
|---|---|
| Etiquetas (T8) | Nada no código nem no banco |
| Comentários (T9) | Sem tabela, sem escrita, sem escape contra XSS testado |
| Histórico por gatilhos (T10) | Sem gatilhos nem tabela de eventos |
| Anexos (T11) | Sem Storage, sem validação de tipo e 10 MB |
| Endurecimento e observabilidade (T13) | `next.config.ts` sem cabeçalhos de segurança (CSP, HSTS, `X-Frame-Options`); sem logs estruturados nem métricas |
| Produção (T14) | Vercel Pro e Supabase Pro (D1, D2), deploy, rollback, vínculo do dono em produção (passo manual em `docs/STATUS.md`, pendência 4) |

## 4. Gargalos e dívidas técnicas

1. **CI bloqueado pelo guarda do piso.**
   - `check:floor` conta 65 asserções removidas ou trocadas contra `main`. Vêm dos testes que mudaram com a passagem dos dados de demonstração para reais.
   - O job para nesse passo, então **build, testes com cobertura, audit e E2E não rodam no CI da T4 nem da T5**. Hoje esses passos só foram verificados localmente.
   - A regra do `CLAUDE.md` impede afrouxar o guarda por conta própria; a saída depende de decisão do Pedro (PR #4).
2. **Branches empilhadas.** A T5 depende da PR #4 não mesclada. Quanto mais a T5 cresce, maior o risco de conflito e mais difícil a revisão.
3. **Demandas capturadas no navegador** misturadas às do banco (seção 3, 🟡): erro visível ao interagir com elas.
4. **Atualização do Agora em dois passos:** primeiro tira a anterior, depois marca a nova (`setNow`). Se o segundo falhar, a empresa fica sem Agora. O índice único impede duas, então não há corrupção.
5. **E2E serializado e sensível ao relógio:**
   - Roda com `workers: 1`, porque os testes gravam no mesmo banco; leva cerca de 3,4 minutos.
   - A semente usa horários relativos ao momento da execução, e uma execução entre 0h e 0h01 pode falhar no "Feito hoje".
6. **Variáveis de ambiente:**
   - O app precisa de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave `sb_publishable_`).
   - O E2E precisa também de `SUPABASE_SERVICE_ROLE_KEY`; as migrações, de `SUPABASE_ACCESS_TOKEN` (fora do CI).
   - `.env.example` lista só as duas públicas, de propósito.
7. **Supabase gratuito** pode pausar o projeto de teste e derrubar E2E e testes de banco. Não há dado real até D1 e D2.
8. **Documentação defasada:** `docs/STATUS.md` diz "atualizado na T3" e cita uma branch antiga; não registra T4 nem T5. `tasks/plan.md` ainda marca T5, T6a e T6d como "dados de demonstração".
9. **Marca em aberto:** o canvas "Moraes Coding — Identidade Visual" (direção B, Space Grotesk, laranja Sinal) diverge da marca V2 aplicada no app (Moraes CodeVibe, Geist, Floresta e Pulso). Decidir antes de mais telas.
10. **Marcadores no código:**
    - Nenhum `TODO`, `FIXME`, `HACK` ou `console.log` esquecido em `src/`. Os `console.log` de `scripts/` são saída de linha de comando.
    - Há 4 atalhos registrados como `shortcut:`:
      - `use-captured.ts` e `e2e/seed.ts`: saem na T5.4.
      - `db-migrate.mjs`: sem `begin`/`commit` dentro da migração.
      - `playwright.config.ts`: o Chromium local.

## 5. Plano de ação imediato

1. **Destravar o CI e mesclar a T4.** O Pedro decide como tratar o guarda do piso (exceção registrada no `CONSTRAINTS.md`, ajuste feito por ele, ou aceitar o vermelho conscientemente). Depois disso, CI verde completo e merge da PR #4 em `main`.
2. **Fechar a T5.3.** Escolher a proposta de edição e importação (A, B, C ou combinação; recomendação: edição da A com importação da C), construir com testes e eliminar o erro das demandas capturadas.
3. **Fechar a T5.4.**
   1. Apagar `demo-data.ts`, `use-captured.ts` e o atalho do navegador, e levar os dados do E2E para `e2e/seed.ts`.
   2. Rodar critique e auditoria do `impeccable`, a revisão de segurança e o `check:full`.
   3. Atualizar `docs/STATUS.md` e `tasks/plan.md`.
   4. Abrir a PR da T5 sobre `main`.
4. **Decidir a marca** (Moraes Coding ou Moraes CodeVibe V2) antes das telas da T8 em diante.
5. **T7 (subtarefas)** com a regra de "mesma empresa e um nível só" no banco e em teste. Depois a sequência do plano: T8, T9, T10 e T11, então T13 e T14.
