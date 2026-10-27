# STATUS REPORT: Raio-X do TrilhaJp3

Data: 2026-10-27 (segunda versão). Auditoria somente leitura do código; este é o único arquivo escrito. Branch auditada: `claude/t5-spec` (`623d7ef`; o código é o mesmo de `d7b0fea`, os 2 commits seguintes são deste relatório), árvore limpa.

Referência de marca: `moraes-coding-marca.zip` (exportado em 27/10/2026), com a direção visual **B · Gráfico** aprovada, a marca oficial da empresa **Moraes Coding**, que substitui a Moraes CodeVibe. Decisão do Pedro em 2026-10-27: o app troca de marca **depois da T5**.

## 1. Resumo executivo

O TrilhaJp3 é o sistema de gestão da empresa, agora Moraes Coding; a v1 é o módulo Projetos e demandas (`docs/SPEC.md`, `tasks/plan.md`). Stack: Next.js 16 (App Router, Server Actions, `cacheComponents`), React 19, TypeScript estrito, Supabase (Postgres com RLS e Auth), `zod`, Vitest, Playwright e CI no GitHub Actions. Não há backend separado: a lógica de servidor são Server Actions e o Proxy do Next.

**Conclusão estimada da v1: cerca de 52%.**

- Prontos: fundação, login, isolamento por empresa, PWA e projetos.
- As demandas estão no meio da troca de dados de demonstração por dados reais (T5, 3 de 4 fatias).
- Faltam 7 das 19 tarefas do plano (subtarefas completas, etiquetas, comentários, histórico, anexos, endurecimento, produção), mais uma tarefa nova: a troca para a marca Moraes Coding.
- A estimativa conta tarefas do plano com peso pelo tamanho (S, M); não é medida de linhas de código.

**Saúde técnica (medida nesta auditoria):**

- `npm run typecheck`: sem erros.
- `npm run lint`: sem erros.
- `vitest`: 300 testes, mas **1 intermitente**. Em 12 execuções, 2 falharam, ambas em `project-list.test.tsx:116` (seção 4).
- `npm audit --audit-level=high`: 0 vulnerabilidades.
- `check:floor`: **65 violações**, que bloqueiam o CI (seção 4).
- O E2E (110 de 110) e os testes de banco passaram nesta sessão de trabalho, antes da auditoria; não rodei de novo porque gravam no Supabase de teste.

## 2. Últimas movimentações (Git)

- **Branches:**
  - `main` contém só T12 (PWA), T2 (empresas e RLS) e T3 (login).
  - `claude/t4-spec` é a **PR #4, aberta e não mesclada** (T4 Projetos e kit de marca V2).
  - `claude/t5-spec` é a branch ativa, criada **em cima da T4**, 19 commits à frente de `main`. Não tem PR.
- **Últimos commits de código:**
  1. `d7b0fea` captura rápida grava no banco.
  2. `c8e15df` mover, Agora e Concluir passo gravam no banco.
  3. `c479316` subtarefas reais e E2E sobre dados semeados.
  4. `06c2d74` Retomar e Demandas leem demandas reais.
  5. `486c039` tabela `tasks` com RLS.
- **Trabalho interrompido:**
  - A T5.3 (escrita) está na metade. Faltam editar título, descrição, prioridade e prazo, e importar as demandas capturadas no navegador; as 3 propostas de design (A, B, C) aguardam a escolha do Pedro.
  - A T5.4 (limpeza, revisões, PR) não começou.
- Não há stash nem alterações pendentes.

## 3. Mapa de módulos

### 🟢 Concluído (interface, lógica, banco e erros)

| Módulo                           | Evidência                                                                                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fundação                         | Next 16, TS estrito, ESLint, Prettier, Vitest, Playwright, CI com 2 jobs (`check`, `db`), `CONSTRAINTS.md` e guarda do piso                                           |
| Empresas e isolamento (T2)       | `organizations`, `memberships`, `private.is_member`; RLS em todas as tabelas; testes de isolamento entre duas empresas                                                |
| Login e sessão (T3)              | `/entrar`, Proxy com `getClaims()`, `getCurrentUser()`, Sair, cadastro público fechado, senha mínima de 12, redirecionamento seguro (`safeNext`)                      |
| PWA (T12)                        | `manifest.ts`, ícones, instalável (com a marca antiga, ver 🟡 Marca)                                                                                                  |
| Projetos (T4)                    | `/projetos`: criar, editar, arquivar e restaurar, com `zod`, Server Actions, RLS e grants por coluna. **Pronto na branch, fora de `main`** (PR #4 aberta)             |
| Leitura das demandas (T5.2)      | Retomar, Demandas (Tabela, Por projeto, Quadro), janela e `/demandas/[id]` leem `tasks`; subtarefas reais (demandas filhas)                                           |
| Ações de demanda (parte da T5.3) | Mover de estado, Agora (uma por empresa, índice único), Concluir passo e captura rápida gravam no banco; a tela muda na hora e volta, com aviso, se a gravação falhar |

### 🟡 Parcial ou com resto de demonstração

| Módulo                                  | O que falta                                                                                                                                                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Demandas (T5)                           | Editar título, descrição, prioridade e prazo (nenhuma tela mostra descrição nem prazo); importar as demandas capturadas; apagar `demo-data.ts`, `use-captured.ts` e o resto do atalho do navegador; revisões e PR           |
| Demandas capturadas antes da T5         | `useWithCaptured` ainda mistura as demandas do `localStorage` (ids `c-…`) com as do banco. Mover, marcar Agora ou concluir uma delas **falha com "Não foi possível salvar"**, porque o id não é uuid. Some com a importação |
| Subtarefas (T7)                         | Leitura e Concluir passo funcionam; criar, renomear e reordenar não existem. O banco ainda não impede filha de outra empresa; não é explorável hoje, porque o cliente não tem grant em `parent_task_id`                     |
| Comentários, anexos e histórico na tela | Grupos aparecem vazios ("Nenhum comentário.") por decisão da spec; sem tabelas                                                                                                                                              |
| **Marca no app**                        | Ainda na Moraes CodeVibe V2. O app inteiro diverge da referência Moraes Coding (detalhe na tabela abaixo). Decidido: troca depois da T5                                                                                     |

**Marca no app × referência (zip):**

| Onde            | No código hoje                                                                                                                                                                                                                                     | Referência Moraes Coding                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome da empresa | "Moraes CodeVibe" em 5 lugares: `app-shell.tsx:98` (rodapé da barra lateral), `entrar/page.tsx:16`, `manifest.ts:8`, `layout.tsx:14`, cabeçalho de `tokens.css`; e no banco, migração `20261026190000_moraes_codevibe.sql` (linha `organizations`) | "Moraes Coding" em texto corrido; "moraes.coding" só no desenho do logo                                                                                    |
| Cores           | 40 variáveis `--mcv-*` em `src/styles/tokens.css` (Tinta, Floresta, Folha, Pulso, Âmbar, Neblina, Papel), claro e escuro; `globals.css` usa as variáveis (211 usos) e tem 6 valores soltos (véu, sombra e 2 neutros)                               | Mata #0C2A1E, Noite #08180F, Alta #14704A, Sinal #FF5A1F (Sinal escuro #B83300 sobre claro), Mostarda #E3B23C, Tijolo #9A3B2E, Névoa #E6ECE7, Gelo #F2F2EE |
| Tipografia      | Geist via `next/font/google` (`layout.tsx`), em tudo                                                                                                                                                                                               | Space Grotesk (títulos, texto e telas) e IBM Plex Mono (números, valores, rótulos)                                                                         |
| Ícone e PWA     | M em circuito com nó de pulso (`brand-icon.tsx`, `public/icon.svg`, `public/icons/*`, `apple-icon.png`, `favicon.ico`); `theme_color` #1B4D2E                                                                                                      | M em 5 barras de BI, a última em Sinal (`04-logo/svg/mc-app-icone.svg`, `mc-icone-*`)                                                                      |
| Regra do acento | Pulso lime significa "Claude trabalhando"                                                                                                                                                                                                          | Sinal laranja, uma vez por peça, no número que importa                                                                                                     |
| Documentos      | `PRODUCT.md`, `DESIGN.md` e 6 superfícies do `impeccable` descrevem a V2                                                                                                                                                                           | Manual de marca e pranchas da direção B                                                                                                                    |

### 🔴 Faltando

| Módulo                                | Situação                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Etiquetas (T8)                        | Nada no código nem no banco                                                                                                       |
| Comentários (T9)                      | Sem tabela, sem escrita, sem escape contra XSS testado                                                                            |
| Histórico por gatilhos (T10)          | Sem gatilhos nem tabela de eventos                                                                                                |
| Anexos (T11)                          | Sem Storage, sem validação de tipo e 10 MB                                                                                        |
| Endurecimento e observabilidade (T13) | `next.config.ts` sem cabeçalhos de segurança (CSP, HSTS, `X-Frame-Options`); sem logs estruturados nem métricas                   |
| Produção (T14)                        | Vercel Pro e Supabase Pro (D1, D2), deploy, rollback; vínculo do dono em produção (passo manual em `docs/STATUS.md`, pendência 4) |

## 4. Gargalos e dívidas técnicas

1. **CI bloqueado pelo guarda do piso.**
   - `check:floor` conta 65 asserções removidas ou trocadas contra `main`, vindas dos testes que mudaram com a troca de dados de demonstração por reais.
   - O job para nesse passo, então **build, cobertura, audit e E2E não rodam no CI da T4 nem da T5**; só foram verificados localmente.
   - O `CLAUDE.md` impede afrouxar o guarda por conta própria; a saída depende de decisão do Pedro (PR #4).
2. **Branches empilhadas.** A T5 depende da PR #4 não mesclada. A troca de marca, se vier antes do merge, piora o empilhamento.
3. **Teste intermitente.**
   - `project-list.test.tsx:116` ("erro do servidor aparece no campo, ligado a ele") às vezes encontra o foco ainda no botão Salvar.
   - O teste confere o foco logo depois de o erro aparecer, antes de o efeito que move o foco rodar. É corrida no teste; a correção provável é esperar o foco com `waitFor`.
   - Pode deixar o CI vermelho ao acaso.
4. **Demandas capturadas no navegador** misturadas às do banco: erro visível ao interagir com elas (seção 3).
5. **Agora em dois passos:** `setNow` tira a anterior e depois marca a nova. Se o segundo passo falhar, a empresa fica sem Agora. O índice único impede duas, então não há corrupção.
6. **E2E serializado e sensível ao relógio:**
   - Roda com `workers: 1` porque os testes gravam no mesmo banco (cerca de 3,4 minutos).
   - A semente usa horários relativos ao momento da execução; uma execução entre 0h e 0h01 pode falhar no "Feito hoje".
7. **Variáveis de ambiente:**
   - O app precisa de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave `sb_publishable_`).
   - O E2E precisa também de `SUPABASE_SERVICE_ROLE_KEY`; as migrações, de `SUPABASE_ACCESS_TOKEN` (fora do CI).
   - `.env.example` lista só as duas públicas, de propósito.
8. **Supabase gratuito** pode pausar o projeto de teste e derrubar E2E e testes de banco. Não há dado real até D1 e D2.
9. **Troca de marca com dado no banco:** o nome da empresa está numa migração já aplicada. A troca precisa de uma migração nova (`update organizations set name = 'Moraes Coding'`) com reversão, não de editar a antiga.
10. **Repositório público e o pacote da marca:** o manual traz o nome completo do Pedro como autor. Só SVGs e tokens podem entrar no repositório, como foi feito com o kit V2; os documentos de estratégia e o manual ficam fora.
11. **Pendências da marca fora do código** (do próprio pacote): busca de anterioridade de "Moraes Coding" no INPI (classes 42 e 35), registro de `moraescoding.com.br`, autorização do sócio, campos entre colchetes.
12. **Documentação defasada:** `docs/STATUS.md` diz "atualizado na T3" e cita uma branch antiga; `tasks/plan.md` ainda marca T5, T6a e T6d como "dados de demonstração".
13. **Marcadores no código:**
    - Nenhum `TODO`, `FIXME`, `HACK` ou `console.log` esquecido em `src/`. Os `console.log` de `scripts/` são saída de linha de comando.
    - Há 4 atalhos registrados como `shortcut:`:
      - `use-captured.ts` e `e2e/seed.ts`: saem na T5.4.
      - `db-migrate.mjs`: sem `begin`/`commit` dentro da migração.
      - `playwright.config.ts`: o Chromium local.

## 5. Plano de ação imediato

1. **Destravar o CI e mesclar a T4.**
   - O Pedro decide o guarda do piso: exceção registrada no `CONSTRAINTS.md`, ajuste feito por ele, ou aceitar o vermelho conscientemente.
   - Corrigir o teste intermitente (`waitFor` no foco).
   - CI verde completo e merge da PR #4 em `main`.
2. **Fechar a T5.3.** Escolher a proposta de edição e importação (recomendação: edição da A com importação da C), construir com testes e eliminar o erro das demandas capturadas.
3. **Fechar a T5.4.**
   1. Apagar `demo-data.ts`, `use-captured.ts` e o atalho do navegador, e levar os dados do E2E para `e2e/seed.ts`.
   2. Rodar critique e auditoria do `impeccable`, a revisão de segurança e o `check:full`.
   3. Atualizar `docs/STATUS.md` e `tasks/plan.md`.
   4. Abrir a PR da T5 sobre `main`.
4. **Nova tarefa: marca Moraes Coding no app** (decidida para depois da T5). Spec própria e processo do `impeccable`:
   - tokens claro e escuro a partir da paleta com contraste medido;
   - Space Grotesk e IBM Plex Mono;
   - ícone, favicon e PWA a partir dos SVGs `mc-*`;
   - textos e migração do nome da empresa;
   - `PRODUCT.md`, `DESIGN.md` e superfícies.

   Antes, decidir o papel do Sinal laranja no app, que hoje tem o Pulso como "Claude trabalhando".

5. **T7 (subtarefas)** com a regra de "mesma empresa e um nível só" no banco e em teste. Depois a sequência do plano: T8, T9, T10 e T11, então T13 e T14.
