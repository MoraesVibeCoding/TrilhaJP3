# Glossário do TrilhaJp3

Um só contexto. A interface fala português; o banco (`docs/SPEC.md`, seção de dados) usa inglês. Esta tabela liga os dois para ninguém tratar o mesmo conceito com dois nomes.

| Termo na tela             | No banco ou no código               | O que é                                                                                                                                  | Não confundir com                                      |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Empresa                   | `organizations`                     | Quem é dono dos dados. Toda tabela de negócio carrega `organization_id`. Na v1 existe uma só: Moraes CodeVibe.                           | Cliente da Moraes CodeVibe                             |
| Vínculo                   | `memberships`                       | Liga uma pessoa a uma empresa, com papel `owner` ou `member`.                                                                            | Permissão de tela                                      |
| Projeto                   | `projects`                          | Trabalho em andamento para um cliente ou produto. Tem **status** (`idea`, `in_progress`, `paused`, `done`).                              | Demanda                                                |
| Demanda                   | `tasks`                             | Unidade de trabalho dentro de um projeto. Tem **estado**, prioridade e subtarefas.                                                       | Projeto                                                |
| Subtarefa                 | `tasks` com `parent_task_id`        | Passo de uma demanda. Um nível só; segundo nível é rejeitado por regra e por teste.                                                      | Demanda                                                |
| Estado                    | `state`: `todo`, `doing`, `done`    | A fazer, Fazendo, Feito. Escrito por extenso na tela; a cor só reforça.                                                                  | **Status** do projeto                                  |
| Status do projeto         | `projects.status`                   | Ideia, Em andamento, Pausado, Concluído.                                                                                                 | **Estado** da demanda                                  |
| Prioridade                | `priority`: `high`, `medium`, `low` | Alta, Média, Baixa.                                                                                                                      | Ordem na lista                                         |
| Agora                     | marca `isNow` (hoje só em memória)  | A única demanda em foco. O Retomar a mostra no topo, com a próxima subtarefa.                                                            | Fazendo (pode haver várias em Fazendo, só uma é Agora) |
| Próxima subtarefa         | primeira subtarefa não concluída    | O primeiro passo que ainda falta.                                                                                                        | Próxima demanda                                        |
| Retomar                   | rota `/`                            | Tela de entrada: o que estava em andamento e onde parou.                                                                                 | Dashboard                                              |
| Feito hoje                | demandas Feito com conclusão no dia | Progresso do dia, à vista.                                                                                                               | Histórico                                              |
| Visão                     | Tabela, Por projeto, Quadro         | Jeito de apresentar as mesmas demandas na página Demandas. A escolha fica salva.                                                         | Página                                                 |
| Modo Foco e Modo Completo | `data-mode` no `<html>`             | Foco mostra o essencial (até 5 itens, barra lateral recolhida); Completo mostra tudo. Só apresentação, os dados são os mesmos.           | Tema (claro e escuro)                                  |
| Tema                      | `data-theme`                        | Claro ou escuro.                                                                                                                         | Modo                                                   |
| Etiqueta                  | `labels`, `task_labels`             | Marcador livre numa demanda (T8).                                                                                                        | Estado                                                 |
| Comentário                | `comments`                          | Texto de um membro numa demanda; escapado contra XSS (T9).                                                                               | Histórico                                              |
| Anexo                     | `attachments`                       | Arquivo (imagem, PDF, documento) de até 10 MB numa demanda (T11).                                                                        | Link do projeto                                        |
| Histórico                 | `task_events`                       | Registro só de inserção, gerado por gatilhos no banco (T10).                                                                             | Comentário                                             |
| Captura rápida            | botão "Nova demanda" e tecla `C`    | Janela de um campo que cria uma demanda em A fazer, Média, no último projeto usado; avisa de título parecido. Hoje fica só no navegador. | Formulário completo de demanda                         |
| Executor                  | adiado                              | Campo futuro "dev via Claude" numa demanda, ligado ao n8n. Não existe ainda.                                                             | Responsável                                            |
| Pulso                     | token `--mcv-pulse`                 | Cor lime da marca V2. Significa "Claude está trabalhando", só isso.                                                                      | Destaque genérico                                      |

## Regras de linguagem na interface

- "Demanda", nunca "tarefa" ou "card", na tela.
- Estado por extenso ("Fazendo"), nunca só ícone ou cor.
- Mensagens de erro dizem causa e próximo passo, sem "ops".
