# T8: etiquetas

Status: **rascunho, aguarda aprovação do Pedro.** Decisões do Pedro em 2026-10-31: etiqueta com cor de uma paleta curta da marca; criar e aplicar direto na demanda, sem tela própria; etiqueta filtra a página Demandas. Tarefa 🎨: a tela passa por 3 propostas do `impeccable` em HTML. Base: `docs/SPEC.md` (seção 4, `labels` e `task_labels`; seção 6, linha T8), ADR 0003, ADR 0007, `CONSTRAINTS.md`.

## 1. Objetivo

O Pedro marca demandas com etiquetas livres ("cliente aguardando", "bug", "financeiro") e filtra a página Demandas por elas. Cada empresa tem as suas etiquetas; nenhuma empresa vê as de outra.

## 2. Requisitos funcionais

1. **Aplicar e criar:** na janela e na página da demanda, um campo "Etiquetas" mostra as etiquetas aplicadas e sugere as da empresa enquanto o Pedro digita. Escolher uma sugestão aplica a etiqueta. Digitar um nome que não existe e confirmar cria a etiqueta, com a cor padrão, e já a aplica.
2. **Tirar:** cada etiqueta aplicada tem um botão "Tirar {nome}". Tirar não apaga a etiqueta da empresa.
3. **Cor:** ao criar, a etiqueta recebe a cor padrão (Névoa). A cor pode ser trocada no próprio campo, entre 5 tons da marca. O nome vai sempre escrito: a cor nunca é a única pista.
4. **Filtrar:** a página Demandas ganha o filtro "Etiqueta", ao lado de Projeto e Prioridade, nas três visões (Tabela, Por projeto, Quadro). Ele mostra só as demandas com aquela etiqueta, entra nas contagens por estado como os outros filtros e fica salvo como eles.
5. **Nome:** de 1 a 40 caracteres, sem repetir dentro da empresa. A comparação ignora maiúsculas, minúsculas e espaços nas pontas: "Bug" e " bug " são a mesma etiqueta.
6. **Só demandas:** subtarefas não recebem etiqueta.
7. **Onde aparecem:** só na janela e na página da demanda, e no filtro. A tabela, os cartões e a Retomar não mostram etiquetas nesta tarefa (decisão do Pedro).

## 3. Paleta (tokens da marca, `docs/brand/moraes-coding/tokens.json`)

| Valor no banco   | Preenchimento      | Texto | Contraste |
| ---------------- | ------------------ | ----- | --------- |
| `nevoa` (padrão) | Névoa `#E6ECE7`    | Noite | 15,3:1    |
| `mata`           | Mata `#0C2A1E`     | Névoa | 12,8:1    |
| `alta`           | Alta `#14704A`     | Gelo  | 5,4:1     |
| `mostarda`       | Mostarda `#E3B23C` | Noite | 9,3:1     |
| `tijolo`         | Tijolo `#9A3B2E`   | Gelo  | 6,2:1     |

Os pares valem nos dois temas: a pílula traz o próprio fundo. Ela tem uma borda de 1px em `--mc-borda-controle`, para não sumir quando o fundo da pílula é igual ao da página (Mata no tema escuro, Névoa no claro). O laranja do sinal fica de fora.

## 4. Banco e contratos

1. Migração nova, reversível, com rollback:
   - `labels`: `id`, `organization_id`, `name` (1 a 40), `color` (`check` com os 5 valores, padrão `nevoa`), `created_at`; índice único em `(organization_id, lower(trim(name)))`;
   - `task_labels`: `task_id`, `label_id`, `organization_id`, com chave primária `(task_id, label_id)`. Duas chaves compostas obrigam demanda e etiqueta a serem da mesma empresa;
   - RLS por `private.is_member(organization_id)` nas duas tabelas, com grants só das colunas que o app usa, como nas tabelas anteriores.
2. Server Actions, no padrão das existentes (devolvem `true` ou `false`, com validação `zod`): `applyLabel(taskId, name)` (cria se não existir), `removeLabel(taskId, labelId)` e `setLabelColor(labelId, color)`. Aplicar numa subtarefa é recusado.
3. A leitura das demandas passa a trazer as etiquetas de cada uma. As etiquetas da empresa chegam junto, para as sugestões e para o filtro.

## 5. Design (3 propostas, `impeccable`)

O `impeccable` traz 3 propostas em HTML, nos dois temas, para o campo de etiquetas na janela e na página (aplicar, criar, tirar, trocar a cor) e para o filtro na Demandas. Só depois da escolha do Pedro a tela é construída.

## 6. Fora do escopo

Tela de gerenciar etiquetas, renomear ou apagar etiqueta da empresa, mais de um filtro de etiqueta ao mesmo tempo, etiquetas na tabela, nos cartões e na Retomar, e etiqueta em subtarefa.

## 7. Testes e critérios de aceitação

1. **Banco (`npm run test:db`):**
   - nome repetido na mesma empresa é recusado, ignorando maiúsculas e espaços;
   - cor fora da paleta é recusada;
   - aplicar uma etiqueta de outra empresa é recusado;
   - membro de outra empresa não lê etiquetas nem aplicações.
2. **Unitários:** as ações validam a entrada; criar e aplicar acontece numa chamada só; o filtro combina com Projeto e Prioridade e com as contagens.
3. **E2E:** criar, aplicar, trocar a cor e tirar uma etiqueta na janela e na página, com o resultado mantido depois de recarregar. O filtro "Etiqueta" funciona nas três visões e continua salvo depois de recarregar. Axe nos dois temas, com as 5 cores.
4. **Checagens:** todas as do `CONSTRAINTS.md`, mais o revisor final do `impeccable`.

## 8. Fatias

1. Migração, RLS e testes de banco. Cerca de 50 min (estimativa).
2. Server Actions e leitura das etiquetas, com testes unitários. Cerca de 45 min.
3. 3 propostas em HTML e escolha do Pedro. Cerca de 45 min.
4. Campo de etiquetas na janela e na página, e filtro na Demandas, com E2E. Cerca de 1h30.
5. Revisão final do `impeccable`, `DESIGN.md` e `docs/STATUS.md`. Cerca de 20 min.

Total estimado: cerca de 4h10.

## 9. Riscos

1. **Etiquetas demais:** sem tela de gerenciar, uma etiqueta criada por engano fica na empresa. Ela só some das demandas. A tela de gerenciar fica registrada como próxima evolução.
2. **Depende da T7?** Não: a T8 parte da `main`. Se a PR da T7 for mesclada antes, esta branch recebe a `main` atualizada antes da PR.
