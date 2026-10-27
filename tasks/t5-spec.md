# T5: Demandas reais e três estados

Status: **rascunho com as 3 decisões respondidas, aguardando aprovação do Pedro.** Nenhum código nem SQL foi escrito. Depende da T4 (PR #4, tabela `projects`). Base: `docs/SPEC.md` (4.2 e 6), ADR 0003, `tasks/t4-spec.md`, `CONSTRAINTS.md`.

## 1. Objetivo

As demandas deixam de ser dados de demonstração. O Pedro cria uma demanda num projeto real, move entre A fazer, Fazendo e Feito, marca a que está "Agora", e tudo fica no Supabase, isolado por empresa. Retomar, Demandas (Tabela, Por projeto, Quadro), a janela da demanda, a página inteira e a captura rápida passam a ler e gravar dados reais. Sai o aviso "Dados de demonstração".

## 2. Fatos de partida

1. As telas leem `demoDemands` e `demoProjects` (`src/lib/demo-data.ts`). O que o Pedro muda (mover, marcar Agora, subtarefas) e o que captura ficam só no navegador (`use-demand-state.ts`, `use-captured.ts`), marcados como `shortcut:` "somem com a T5".
2. A demanda de demonstração tem subtarefas, comentários, anexos e histórico. Esses quatro são tarefas próprias: T7, T9, T11 e T10.
3. `/demandas/[id]` é estática (`generateStaticParams` sobre os dados de demonstração).
4. A T4 deixou o modelo pronto: RLS por `private.is_member`, grants por coluna, Server Actions com `zod`, `getCurrentUser()`, `await connection()` antes de ler o Supabase.

## 3. Requisitos funcionais

1. **Tabela `public.tasks`** (`docs/SPEC.md` 4.2): `id`, `organization_id`, `project_id`, `parent_task_id` (nulo; subtarefas na T7), `title` (1 a 200), `description` (até 5.000), `state` (`todo` | `doing` | `done`, padrão `todo`), `priority` (`high` | `medium` | `low`, padrão `medium`), `due_date` (opcional), `is_now` (ver decisão 1), `done_at` (preenchido por gatilho quando o estado vira `done`, limpo quando sai), `created_by`, `created_at`, `updated_at`, `archived_at`.
2. **Projeto da mesma empresa:** chave estrangeira composta `(organization_id, project_id)` para `projects (organization_id, id)`. Uma demanda nunca aponta para projeto de outra empresa, mesmo que a RLS falhe.
3. **RLS** igual à de projetos: membros leem, criam e alteram as demandas da própria empresa; ninguém apaga (arquivar); empresa, projeto de origem e autor não mudam pelo cliente (grants por coluna).
4. **Telas com dados reais:** Retomar (Agora, Em andamento, Feito hoje), Demandas nas três visões com filtros, janela da demanda e `/demandas/[id]` (dinâmica). A atividade mais recente vem de `updated_at`.
5. **Escrita:** criar pela captura rápida (título e projeto real; aviso de título parecido continua), mover de estado (Quadro e janela), marcar e tirar de Agora, editar título, descrição, prioridade e prazo na página inteira. Server Actions com `zod`; a empresa vem da sessão.
6. **Sai o atalho do navegador:** `use-demand-state.ts`, `use-captured.ts` e `demo-data.ts` deixam de existir (ver decisão 3).

## 4. Fatias (cada uma com testes e commit próprios)

1. Banco: `tasks`, chave composta, gatilho de `done_at`, RLS, testes de isolamento.
2. Leitura: Retomar e Demandas lendo dados reais; estados vazios.
3. Escrita: captura, mover, Agora, edição na página inteira.
4. Limpeza: sai a demonstração e o atalho do navegador; `/demandas/[id]` dinâmica.

## 5. Testes e critérios de aceitação

1. **Banco (`npm run test:db`):** isolamento entre duas empresas (ler, criar, alterar); demanda não aponta para projeto de outra empresa; não apaga; `done_at` liga e desliga com o estado; regra da decisão 1.
2. **Unitários:** esquemas `zod`, Server Actions com o Supabase simulado, telas com listas vazias e cheias.
3. **E2E:** criar pela captura, mover no Quadro, marcar Agora e ver no Retomar, editar na página inteira, "Feito hoje" depois de concluir; sem login, tudo leva a `/entrar`.
4. **Acessibilidade:** as 10 telas atuais do `e2e/accessibility.spec.ts` agora com dados reais, mais os estados vazios.
5. `CONSTRAINTS.md` e CI verdes. Antes de subir: `impeccable` (critique e auditoria das telas que mudaram), revisão de segurança, `doubt-driven-development`.

## 6. Fora do escopo

Subtarefas (T7), etiquetas (T8), comentários (T9), histórico (T10), anexos (T11), apagar de vez, ordenar por arrastar.

## 7. Riscos

1. **Tamanho:** mexe em todas as telas. Mitigação: 4 fatias, cada uma verde antes da próxima.
2. **Telas que hoje mostram subtarefas, comentários e anexos** ficam vazias até as tarefas deles (decisão 2).
3. **Demandas capturadas no navegador** se perdem se não forem importadas (decisão 3).

## 8. Decisões

1. **"Agora". Decidido pelo Pedro em 2026-10-27: a recomendação.** um campo `is_now` na demanda, com no máximo uma "Agora" por empresa (índice único parcial); na v1 só o Pedro usa. Alternativa: uma "Agora" por pessoa, numa tabela própria (mais certo para vários usuários, mais código agora).
2. **Subtarefas, comentários, anexos e histórico até as tarefas deles. Decidido pelo Pedro em 2026-10-27: visíveis.** os grupos continuam visíveis, vazios, com uma frase curta ("Nenhuma subtarefa ainda."). Alternativa: esconder os grupos até existirem.
3. **Demandas que o Pedro capturou no navegador. Decidido pelo Pedro em 2026-10-27: importar.** na primeira abertura depois da T5, se houver alguma, oferecer "Importar N demandas" para um projeto escolhido; depois o atalho sai. Alternativa: descartar (eram de teste).
