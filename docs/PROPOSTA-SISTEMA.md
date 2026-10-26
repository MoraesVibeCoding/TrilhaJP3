# Proposta: TrilhaJp3 completo e robusto

Status: **aprovada em 2026-10-22: as 5 releases e os 3 acréscimos da R1** (página inteira com link, captura rápida, barra lateral recolhível). Pendente: meta de venda a outras empresas (assumido uso interno, R4 e R5 esperam). A `docs/SPEC.md` continua valendo para a R1.
Base: `docs/REFERENCIAS.md` (Linear, Things, Notion, Monday, Jira, Trello, Basecamp, Sunsama), `PRODUCT.md`, `DESIGN.md`.
**✔** sustentado por fonte consultada. **◦** conhecimento meu, não verificado nesta sessão.

## 1. Ideia central

Um sistema de gestão **calmo e denso**, em que o dia começa em **Retomar**, o planejamento acontece em **visões sobre os mesmos dados**, e cada demanda se abre em uma **janela** com tudo dela agrupado. Cada referência contribui com uma coisa só:

| Referência | O que o TrilhaJp3 leva | O que deixa de fora |
|---|---|---|
| Things 3, Sunsama | Retomar como "Hoje"; começo de sessão curto ✔ | Ritual obrigatório |
| Linear | Densidade, ruído mínimo, teclado e paleta de comandos ✔◦ | Vocabulário de engenharia |
| Notion | Visões com abas, filtros por visão, abrir como janela, painel ou página ✔ | Propriedades ilimitadas |
| Trello | Quadro simples, linha do tempo e calendário por prazo ✔ | Visões presas a plano pago |
| Monday | Arrastar muda o estado, "colorir por" opcional ✔ | Excesso de cores de status |
| Jira | Campos agrupados e recolhíveis, ações sempre no mesmo lugar ✔ | Lista longa de campos |
| Basecamp | Andamento por julgamento ("onde está parado"), não só contagem ✔ | Atualização manual obrigatória |

**Regra de ouro:** poucos controles, todos bem acabados. "Completo" aqui significa cobrir o ciclo inteiro (planejar, executar, acompanhar, entregar), não ter todos os recursos de todos os produtos.

## 2. Mapa de capacidades por release

Cada release fecha com o sistema usável. Nenhuma depende de refazer a anterior.

### Release 1: Projetos e demandas (spec aprovada)
Retomar, Demandas em 3 visões (Tabela, Por projeto, Quadro), janela da demanda com subtarefas, etiquetas, comentários, anexos e histórico; login, multiempresa e PWA.
**Acréscimos aprovados:** abrir a demanda em página inteira com link permanente; captura rápida de demanda de qualquer tela; barra lateral recolhível.

### Release 2: Planejamento
- **Prazo e data de início** na demanda (o modelo já tem `due_date`).
- **Visões Calendário e Linha do tempo**, com arrastar para mudar a data (Trello, Notion) ✔.
- **Visões salvas** (filtro, ordem, agrupamento e tipo) com nome (Notion, Trello) ✔.
- **Paleta de comandos e atalhos de teclado** (Linear) ✔◦.
- **Prioridade e estado "Parado"** destacados em Retomar.
- **Andamento do projeto por julgamento**, no estilo Hill Chart: cada projeto marca "ainda decidindo" ou "executando" (Basecamp) ✔.

### Release 3: Fluxo
- **Modelos de projeto e de demanda** (Trello e Notion usam modelos ◦).
- **Demandas recorrentes** ◦.
- **Regras simples de automação** (ex.: mover para Feito quando todas as subtarefas fecham) (Monday, Trello) ◦.
- **Estados configuráveis por projeto**, além dos 3 fixos (Jira, Monday) ◦.

### Release 4: Equipe
- **Mais usuários por empresa**, convites e papéis; **responsável** pela demanda.
- **Notificações** e menções em comentários.
- **Visões compartilhadas** da equipe.
- Pré-requisito: o isolamento por empresa e a RLS da T2, já previstos.

### Release 5: Plataforma
- **Importar e exportar** (CSV, JSON), **API**, **webhooks**.
- **Painel e relatórios** (carga por pessoa, demandas paradas, prazo vencido) (Notion, Trello, Asana) ✔.
- **Cadastro de novas empresas, cobrança e planos** (para venda a terceiros).

## 3. Modelo de dados: o que cada release acrescenta

- R1: o da spec (`organizations`, `memberships`, `projects`, `tasks`, `labels`, `comments`, `attachments`, `task_events`).
- R2: `tasks.start_date`, `saved_views` (empresa, dono, nome, tipo, filtros em `jsonb`), `projects.stage`.
- R3: `templates`, `recurrences`, `automation_rules`, `workflow_states` por projeto.
- R4: `invitations`, `task_assignees`, `notifications`, `mentions`.
- R5: `api_tokens`, `webhooks`, `import_jobs`, tabelas de faturamento.

Regra mantida: **toda tabela com `organization_id` e RLS**, histórico por gatilhos, exclusão lógica.

## 4. Telas e o processo de design

Toda tela nova ou revisada passa pelo `impeccable`: o `impeccable` avalia, traz **3 propostas**, o Pedro aprova, e só então se constrói.

| Release | Telas e componentes (todas via `impeccable`) |
|---|---|
| R1 | Casca, Retomar, Demandas (3 visões), janela da demanda, projetos, login, vazios e erros |
| R2 | Calendário, Linha do tempo, visões salvas, paleta de comandos, andamento do projeto |
| R3 | Modelos, recorrência, editor de regras, estados do projeto |
| R4 | Convites, responsável, notificações, visões da equipe |
| R5 | Painel e relatórios, importação, tokens e webhooks, cobrança |

## 5. O que torna robusto (vale para todas as releases)

- Testes antes do código (Red, Green, Refactor), pirâmide 80/15/5, CI sempre verde.
- RLS testada com duas empresas em cada tabela nova.
- `CONSTRAINTS.md` como contrato de qualidade: nenhum teste afrouxado em silêncio.
- WCAG 2.1 AA: navegação por teclado e leitor de tela.
- Logs estruturados e métricas RED desde a R1; backup documentado antes de dado real.
- Deploy progressivo e rollback testado; Vercel Pro e Supabase Pro antes de dado real (D1 e D2).

## 6. Riscos e onde eu cortaria

| Risco | Impacto | Resposta |
|---|---|---|
| **Escopo grande demais** para um desenvolvimento sem prazo e com um único usuário | Alto | Entregar por release; só abrir a R(n+1) com a R(n) usada de verdade |
| Recursos de equipe (R4) antes de haver equipe | Médio | Segurar a R4 e a R5 até existir segundo usuário ou cliente real |
| Automações e estados configuráveis (R3) complicam teste e RLS | Médio | Fazer por último dentro da R3, com `doubt-driven-development` |
| Excesso de visões e controles | Médio | Limite de 6 tipos de visão e revisão do `impeccable` a cada release |
| Licença de produtos de referência (ex.: Plane é AGPL) | Baixo | Só inspiração de padrões; nenhum código copiado |

**O que eu cortaria sem dó:** Gantt, Mapa e dependências entre tarefas. Ficam fora de todas as releases até alguém pedir com um caso real.

## 7. Decisões que dependem do Pedro

1. Aprova o desenho em 5 releases, mantendo a R1 como está na spec?
2. Os 3 acréscimos baratos entram na R1 (página inteira, captura rápida, barra recolhível)?
3. O alvo é só uso interno por enquanto, ou a venda a outras empresas é meta de curto prazo? Isso decide quando a R4 e a R5 entram.
