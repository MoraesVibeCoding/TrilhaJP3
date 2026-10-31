# T7: subtarefas de um nível

Status: **aprovada pelo Pedro em 2026-10-30 ("De acordo"); proposta C escolhida em 2026-10-31; construída.** Decisões do Pedro em 2026-10-30: criar, renomear, remover e marcar como feita (sem reordenar); estado só "feita ou não"; tela com 3 propostas do `impeccable` em HTML. Base: `docs/SPEC.md` (4.2 e 6, linha T7), `tasks/t5-spec.md` (decisão 4), ADR 0003, `CONSTRAINTS.md`.

## 1. Objetivo

O Pedro quebra uma demanda em passos dentro do próprio app: adiciona subtarefas, corrige o nome, remove as que não servem e marca cada uma como feita. Subtarefa tem um só nível: uma subtarefa nunca tem subtarefas, e o banco recusa a tentativa.

## 2. O que já existe (T5)

1. A coluna `tasks.parent_task_id` existe, mas o cliente não pode gravá-la (fica fora do `grant insert`).
2. Retomar, Demandas, a janela e a página da demanda leem as filhas como passos, na ordem de criação. "Concluir passo" conclui a próxima filha não feita.
3. A lista de subtarefas (`SubtaskList`) só mostra; não há como criar nem editar.

## 3. Requisitos funcionais

1. **Criar:** na janela e na página da demanda, um campo "Nova subtarefa" adiciona um passo no fim da lista. Enter cria; título de 1 a 200 caracteres, com o erro "Escreva o título da subtarefa." para título vazio (o texto da maquete aprovada).
2. **Marcar como feita:** cada subtarefa tem uma caixa de marcar. Marcar grava `state = 'done'`; desmarcar grava `state = 'todo'`. "Concluir passo" continua igual e conclui a próxima não feita.
3. **Renomear:** editar o título no lugar, com as mesmas regras do item 1. Esc cancela.
4. **Remover:** arquiva a subtarefa (`archived_at`), como as demandas. Ela some da lista e da contagem de passos. Sem desfazer nesta tarefa.
5. **Um só nível, no banco:** um gatilho recusa gravar uma subtarefa cuja mãe já seja subtarefa. A mesma regra recusa uma mãe de outra empresa, de outro projeto ou arquivada. Subtarefa não pode ser "Agora" (`is_now`).
6. **Onde aparecem:** só dentro da demanda (janela, página, bloco Agora da Retomar e contagens de passos). A tabela, o Quadro e os cartões de projeto continuam só com demandas de primeiro nível, como hoje.
7. **Erros:** se a gravação falhar, a tela volta ao estado anterior e mostra o aviso que já existe ("Não foi possível salvar. Tente de novo.", de `use-demand-state.ts`), como mover e concluir passo.

## 4. Requisitos não funcionais

1. Segurança: RLS por empresa como nas demandas. O cliente passa a poder gravar `parent_task_id` só na criação; a alteração continua sem esse campo, então uma demanda nunca troca de mãe. Validação com `zod` nas Server Actions.
2. Acessibilidade: caixas de marcar com nome ("Marcar {título} como feita"), foco visível, alvos de 44px, avisos em região viva. Axe nos dois temas.
3. Marca Moraes Coding: tokens `--mc-*`, ícones do componente `Icon`, nenhum laranja novo (o sinal continua só no passo atual da Agora).
4. Nenhuma dependência nova.

## 5. Banco e contratos

1. Migração nova (reversível, com rollback):
   - `grant insert (parent_task_id)` para `authenticated`;
   - gatilho `before insert or update` em `tasks` que, quando `parent_task_id` não é nulo, exige uma mãe existente, de primeiro nível, não arquivada, da mesma empresa e do mesmo projeto. Erro: `subtarefa só tem um nível`;
   - `check (parent_task_id is null or not is_now)`.
2. Server Actions em `src/app/(app)/demandas/actions.ts`, no padrão das existentes (devolvem `true` ou `false`): `addSubtask(parentId, title)`, `renameSubtask(id, title)`, `toggleSubtask(id, done)` e `archiveSubtask(id)`.
3. `Subtask` em `src/lib/demands.ts` passa a ter `id`, para editar pela chave (hoje a lista usa o título como `key`).

## 6. Design (3 propostas, `impeccable`)

**Escolhida pelo Pedro em 2026-10-31: C · Menu por passo** (maquete em `https://claude.ai/artifact/CqizyxHGgUKKQvCFEfwFit`): caixa de marcar e título na linha, botão "Mais opções" com Renomear e Remover, e "Adicionar subtarefa" que abre o campo só quando é preciso.

O `impeccable` traz 3 propostas para a lista de subtarefas editável, na janela e na página da demanda, em HTML, nos dois temas. Só depois da escolha do Pedro a tela é construída. O que as propostas decidem: onde fica o campo de criar, como se renomeia (clique no título ou botão) e onde fica remover.

## 7. Fora do escopo

Reordenar passos, prazo, prioridade e responsável por subtarefa, desfazer a remoção, subtarefa na tabela e no Quadro, segundo nível.

## 8. Testes e critérios de aceitação

1. **Banco (`npm run test:db`):**
   - segundo nível é recusado;
   - mãe de outra empresa, de outro projeto ou arquivada é recusada;
   - subtarefa com `is_now` é recusada;
   - membro de outra empresa não lê nem altera subtarefas.
2. **Unitários:** cada Server Action valida a entrada e devolve `false` em erro. Os componentes criam, renomeiam, marcam e removem, e a tela volta ao estado anterior quando a gravação falha.
3. **E2E:** criar, renomear, marcar, desmarcar e remover uma subtarefa na janela e na página, e o resultado continua depois de recarregar. "Concluir passo" segue a lista nova. Axe nos dois temas.
4. **Checagens:** todas as do `CONSTRAINTS.md`, mais o revisor final do `impeccable`.

## 9. Fatias

1. Migração, regra de um nível e testes de banco. Cerca de 45 min (estimativa).
2. Server Actions e `id` na `Subtask`, com testes unitários. Cerca de 40 min.
3. 3 propostas em HTML e escolha do Pedro. Cerca de 40 min.
4. Tela escolhida na janela e na página, com E2E. Cerca de 1h.
5. Revisão final do `impeccable`, `DESIGN.md` e `docs/STATUS.md`. Cerca de 20 min.

Total estimado: cerca de 3h30.

## 10. Riscos

1. **Corrida em "Concluir passo":** marcar uma subtarefa e concluir o passo quase ao mesmo tempo. A tela segue a última resposta do servidor; o teste E2E cobre a sequência.
2. **Migração em produção (T14):** entra junto com as outras. O rollback tira o gatilho, o `check` e o `grant`, sem apagar dado.
