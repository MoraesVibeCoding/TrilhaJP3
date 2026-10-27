# T5: Demandas reais e três estados

Status: **proposta, aguardando "DE ACORDO" do Pedro.** Base: `docs/SPEC.md` 4.2, `GLOSSARY.md`, `tasks/plan.md` (T5 e T6a), `tasks/t4-spec.md`.

## 1. Objetivo

O Pedro cria demandas reais num projeto, move entre A fazer, Fazendo e Feito, marca uma como Agora e arquiva. Os dados ficam no Supabase, isolados por empresa (RLS). Todas as telas (Retomar, Demandas em Tabela, Por projeto e Quadro, janela e página da demanda, captura rápida) deixam os dados de demonstração e passam a ler projetos e demandas reais. O aviso "Dados de demonstração" sai.

## 2. Fatos de partida

1. As telas leem `src/lib/demo-data.ts` (4 projetos, demandas fixas, `demoNow`). A página `/demandas/[id]` é gerada no build por `generateStaticParams`.
2. Mudanças de estado, Agora e subtarefas marcadas ficam no navegador (`use-demand-state.ts`, chave `trilhajp3-alteracoes`). A captura rápida grava no navegador (`use-captured.ts`, chave `trilhajp3-capturadas`). Os dois têm `shortcut:` que manda removê-los na T5.
3. A T4 deixou `public.projects` com RLS, grants por coluna, `private.set_updated_at()` e o padrão de Server Actions com `zod` e `getCurrentUser()`.
4. O glossário fixa a tabela como `tasks` (Demanda), com estado `todo` | `doing` | `done`. Subtarefas usam `parent_task_id` na mesma tabela, mas são da T7.

## 3. Requisitos funcionais

1. **Tabela `public.tasks`** (`docs/SPEC.md` 4.2, sem os campos de outras tarefas): `id uuid`, `organization_id` (FK, `on delete cascade`), `project_id` (FK composta com `organization_id`, ver item 2), `title` (1 a 200 caracteres, o mesmo limite da captura), `description` (até 5.000, opcional), `state` (`todo` | `doing` | `done`, padrão `todo`), `priority` (`high` | `medium` | `low`, padrão `medium`), `is_now` (booleano, padrão falso), `done_at` (opcional), `created_by` (padrão `auth.uid()`), `created_at`, `updated_at` (gatilho), `archived_at` (opcional). Índices em `organization_id` e `project_id`.
2. **A demanda e o projeto são da mesma empresa.** Chave estrangeira composta `(project_id, organization_id)` para `projects (id, organization_id)`, com um índice único novo em `projects`. Sem isso, um membro poderia ligar uma demanda da sua empresa a um projeto de outra.
3. **Uma única Agora por empresa:** índice único parcial em `organization_id` onde `is_now` e `archived_at is null`. Marcar uma nova Agora desmarca a anterior na mesma Server Action. Arquivar ou mover para Feito desmarca.
4. **`done_at` pelo banco:** um gatilho grava `now()` quando o estado vira `done` e limpa quando sai de `done`. O Feito hoje do Retomar lê `done_at` (o histórico da T10 ainda não existe; `docs/PRINCIPIOS-OBJETIVOS.md` já prevê isso).
5. **RLS** igual à de `projects`: `to authenticated`, tudo por `private.is_member(organization_id)`; ler, criar e alterar; **sem apagar** (arquivar é `archived_at`). Grants por coluna: `organization_id`, `project_id` e `created_by` não mudam depois de criados. `anon` sem acesso.
6. **Server Actions com `zod`:** criar (título, projeto, prioridade, descrição opcional), mover de estado, marcar e desmarcar Agora, editar título, descrição e prioridade, arquivar e restaurar. A empresa vem de `getCurrentUser()`, nunca do formulário. Erros por campo, em pt-BR.
7. **Telas com dados reais** (🎨 só onde a interface muda; ver decisão 4): Retomar, as três visões da Demandas, a janela e a página `/demandas/[id]` (deixa de ser estática e passa a ler do banco), a captura rápida (lista os projetos ativos reais e grava no banco). O "Mover para…" do Quadro e da janela chama a Server Action. Projeto arquivado não aparece na captura; suas demandas continuam visíveis.
8. **Saem:** `demo-data.ts` (os tipos e constantes de estado e prioridade migram para um módulo próprio), `use-captured.ts`, o trecho de estado e Agora de `use-demand-state.ts`, os avisos de demonstração e `generateStaticParams`. As chaves antigas do navegador são ignoradas e apagadas na primeira carga.

## 4. Testes e critérios de aceitação

1. **Integração (`npm run test:db`):** membro lê, cria, altera e arquiva demandas da própria empresa; não lê nem altera as da outra; não cria demanda em outra empresa; **não liga demanda a projeto de outra empresa**; não muda `organization_id`, `project_id` nem `created_by`; não apaga; `anon` sem acesso; segunda Agora na mesma empresa é recusada; `done_at` é gravado e limpo pelo gatilho; `updated_at` muda.
2. **Unitários:** esquema `zod` (limites, estados e prioridades válidos); Server Actions com o Supabase simulado (empresa vinda do usuário, troca de Agora, mover, arquivar); conversão das linhas do banco para o formato das telas.
3. **E2E:** com o usuário fictício e a empresa de teste do `global-setup`, cria um projeto e uma demanda pela captura, move para Fazendo, marca Agora (aparece no topo do Retomar), move para Feito (aparece em Feito hoje), abre `/demandas/[id]` pelo link, arquiva. Sem login, `/demandas` leva a `/entrar`.
4. **Acessibilidade:** Retomar, Demandas (três visões), janela e página da demanda no `e2e/accessibility.spec.ts`, claro e escuro, sem regressão.
5. `CONSTRAINTS.md` verde, CI verde. Antes de subir: `impeccable` (critique e auditoria nas telas que mudarem), revisão de segurança e `doubt-driven-development` (RLS de escrita e FK entre empresas são alto risco).

## 5. Fora do escopo

Subtarefas (T7: a janela mostra "Sem subtarefas"; marcar subtarefa some até lá), etiquetas (T8), comentários (T9), histórico (T10: a seção Histórico mostra só "Criada em…"), anexos (T11), prazo (`due_date`), estimativa, aviso de excesso em Fazendo, arrastar no Quadro, migrar as demandas capturadas no navegador para o banco.

## 6. Riscos

1. **Demanda ligada a projeto de outra empresa:** RLS só confere `organization_id`. Mitigação: FK composta (item 3.2) e teste específico.
2. **Corrida ao marcar Agora** (duas abas): o índice único parcial recusa a segunda; a Server Action desmarca e marca em sequência e mostra erro claro se perder a corrida.
3. **Telas que eram estáticas passam a depender do banco:** `await connection()` antes de ler, como na T4; estados de carregamento e erro conferidos.
4. **Perda do que está no navegador:** demandas capturadas e mudanças locais eram de demonstração. Mitigação: decisão 2.
5. **Diff grande** (banco, actions e 5 telas): dividir em PRs por camada (seção 8).

## 7. Decisões para o Pedro

1. **Nome da tabela.** Recomendo `tasks`, como já está em `docs/SPEC.md` e no `GLOSSARY.md`; a interface continua dizendo "demanda". Alternativa: renomear para `demands` e atualizar os dois documentos.
2. **O que está no navegador.** Recomendo descartar (eram demandas de teste sobre projetos de demonstração). Alternativa: um botão único "Importar demandas capturadas" que pede o projeto de destino.
3. **Agora no banco.** Recomendo `is_now` na própria demanda, uma por empresa (só o Pedro usa na v1). Alternativa: uma por usuário, numa tabela separada, útil só quando houver mais membros.
4. **Interface.** Recomendo **não** abrir 3 propostas do `impeccable` para as telas que só trocam a fonte de dados, e abrir só para o que é novo: editar título, descrição e prioridade na janela, e arquivar e restaurar demanda. Alternativa: rodada completa de 3 propostas em todas as telas da T5.

## 8. Tarefas depois da aprovação

1. Teste de integração vermelho; migração `tasks` com RLS, grants por coluna, FK composta, índice da Agora e gatilhos de `updated_at` e `done_at`; reversão; verde. (PR 1)
2. Esquema `zod`, Server Actions e leitura do banco com testes unitários. (PR 1)
3. 🎨 Propostas do `impeccable` para editar e arquivar na janela (conforme a decisão 4); escolha do Pedro.
4. Trocar as telas para dados reais, remover os dados de demonstração e os `shortcut:` da T5; E2E e acessibilidade. (PR 2)
5. `impeccable` (critique e auditoria), revisão de segurança, `doubt-driven-development`, `npm run check:full`, `docs/STATUS.md` e `tasks/plan.md`. (PR 2)
