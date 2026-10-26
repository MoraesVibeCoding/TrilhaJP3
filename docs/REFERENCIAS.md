# Referências de design e funcionalidade: TrilhaJp3

Contexto para o `impeccable` e para o roadmap. Superfícies alvo: **Retomar**, **Demandas** (visões trocáveis) e **janela da demanda**. Modo: Operate.
Origem: pesquisa de 2026-10-22. **✔** = sustentado por fonte consultada. **◦** = conhecimento geral meu, não verificado nesta sessão.
Regra: referência informa, não se copia. Layout, cores e fontes continuam os do `DESIGN.md` (Caderno de Obra, verde-floresta discreto).

## 1. Notion

**Influência de design**
- Tudo é um banco de dados com **visões**: nasce como Tabela e se adicionam visões pelo "+" ao lado das abas. Visões: Tabela, Quadro, Lista, Linha do tempo, Calendário, Galeria, Gráfico ✔.
- Cada visão escolhe **como abrir o item**: painel lateral, janela central ou página inteira. Tabela, Quadro, Lista e Linha do tempo abrem em painel lateral por padrão; Galeria e Calendário abrem em janela central ✔.
- Filtros, ordenação e agrupamento são da visão ✔.

**Pegar:** abas de visão com "+"; filtros/ordem/grupo por visão; janela central da demanda (é o "center peek" do Notion, igual à sua escolha); opção de abrir em página inteira.
**Evitar:** liberdade demais (propriedades e visões ilimitadas) para um único usuário; fraco como caixa de entrada de execução pura ✔ (fonte: comparativos).

## 2. Monday.com

**Influência de design**
- Quadro Kanban gerado a partir de uma coluna de status; arrastar o cartão atualiza o status na tabela principal ✔.
- Gantt e Calendário com "agrupar por" e "colorir por" status, prioridade ou responsável ✔.
- Status em cores fortes por rótulo ◦. Usuários pedem repetir cores e usar hex porque o excesso de rótulos coloridos vira ruído ✔ (pedidos no fórum).

**Pegar:** arrastar entre colunas muda o estado (visão Quadro); "colorir por" como controle opcional.
**Evitar:** paleta de status saturada. No TrilhaJp3 o estado é escrito por extenso e cor é só reforço (`DESIGN.md`).

## 3. Jira

**Influência de design**
- Redesenho da visão da issue para **agrupar ações e informações** e facilitar ler e atualizar ✔.
- Barra lateral recolhível, com borda arrastável ✔.
- Issue pode abrir como painel lateral no quadro, em vez de janela pop-up ✔.
- Crítica registrada: painel lateral com muitos campos fica difícil de navegar; pedido de abas virarem grupos recolhíveis ✔.

**Pegar:** na janela da demanda, campos em **grupos recolhíveis** (Subtarefas, Comentários, Anexos, Histórico), com as ações no mesmo lugar sempre; barra lateral recolhível no computador.
**Evitar:** lista longa de campos; excesso de configuração.

## 4. Trello

**Influência de design**
- Quadro simples é o padrão; outras visões: Linha do tempo, Tabela, Calendário, Painel, Mapa ✔.
- Linha do tempo posiciona cartões por início e prazo; datas se mudam arrastando; faixas agrupam por lista, membro ou etiqueta ✔.
- Tabela junta cartões num formato de planilha e a configuração pode ser salva como visão ✔.
- Cartão abre em janela sobre o quadro, com o fundo escurecido ◦.

**Pegar:** visão Quadro simples; abrir a demanda sobre a lista com fundo escurecido (padrão que o Pedro pediu); Tabela salvável como visão.
**Evitar:** esconder visões atrás de plano pago é decisão comercial deles, não de usabilidade.

## 5. Síntese: o que as quatro dizem sobre o nosso layout

1. **Visões sobre os mesmos dados** é consenso (Notion, Trello, Monday). Confirma o seletor de visões da página Demandas.
2. **Como abrir o item é uma escolha por visão.** A janela central é um padrão estabelecido (Notion, Trello), não exceção. Vale oferecer depois "abrir em página inteira".
3. **O risco comum é excesso:** campos demais (Jira), cores demais (Monday), visões demais (Notion). O TrilhaJp3 deve ficar com poucos controles.
4. **Estado e cor:** o estado nunca depende só de cor.

## 6. Funcionalidades candidatas

Cabem na v1 (já no roadmap):

| Funcionalidade | Origem | Onde entra |
|---|---|---|
| Abas de visão com "+" e lembrança da escolha | Notion | T6a |
| Filtros, ordenação e agrupamento por visão | Notion | T6a |
| Visão Quadro: arrastar muda o estado | Monday, Trello | T6c |
| Visão Por projeto (agrupar) | Notion | T6b |
| Janela com grupos recolhíveis | Jira | T1-R, T5, T9, T11 |

Depois da v1 (fora do escopo aprovado na `docs/SPEC.md`):

| Funcionalidade | Origem | Observação |
|---|---|---|
| Visão Calendário e Linha do tempo por prazo | Notion, Trello, Monday | O modelo já tem `due_date` |
| Visão salva por usuário e visões compartilhadas | Notion, Trello | Depende de mais de um usuário |
| Abrir em página inteira, com link permanente | Notion | Rota `/demandas/[id]` |
| Painel e gráficos | Notion, Trello | Fora da v1 |
| Barra lateral recolhível no computador | Jira | Pequeno |
| Automações, Gantt, Mapa | Monday, Trello | Não recomendo para a v1 |

## 7. Origin UI (hoje coss ui)

`originui.com` redireciona para `coss.com/ui` (lido em 2026-10-22). Biblioteca de componentes sobre Base UI e Tailwind (copiar e colar), 529 exemplos, claro e escuro. Avaliados no código-fonte e na documentação: Button, Input, Table, Dialog, Segmented Control, Empty, Kbd. **Não avaliados:** Command, Toolbar, Field, Select, Meter (só vi a descrição na lista).

| Componente | O que observei | Veredito para o TrilhaJp3 |
| --- | --- | --- |
| Button | Altura 36px no celular e 32px no computador. Em ponteiro de toque (`pointer-coarse`) cria área clicável invisível de 44px. Foco: anel de 2px com 1px de afastamento. Desabilitado a 64% de opacidade | **Adotar a ideia:** controle visual compacto no mouse, alvo de 44px no iPad por área invisível. Anel de foco com afastamento. **Rejeitar:** 64% de opacidade (contraste de texto desabilitado não é exigido pela WCAG, mas some em papel esverdeado; manter nosso cinza) |
| Input | Borda `input` própria, sombra de 1 camada, 3 tamanhos, placeholder a 72% | Já temos `--mcv-control-line` (3:1). Placeholder a 72% do texto suave **falharia 4,5:1**; manter `--mcv-text-soft` |
| Table | Duas variantes: padrão (filetes) e `card` (linhas separadas, raio grande, sombra) | Nossa tabela segue a padrão. A variante `card` confirma o que fazemos abaixo de 60rem |
| Dialog | Botão de fechar por padrão; no celular **gruda embaixo** (`bottomStickOnMobile`) | Hoje vamos a tela cheia no celular. Folha embaixo é alternativa, **decisão do Pedro** se quiser mudar (celular é só consulta na v1) |
| Segmented Control | A doc diz que é só visual e manda escolher o primitivo pela interação: filtro exclusivo que pode ser limpo = Toggle Group; modo = Radio Group; rotas = links | Confirma nossas escolhas: faixa de contagens (botões com `aria-pressed`, limpável) e Foco/Completo (botão com `aria-pressed`). Rotas continuam links com `aria-current` |
| Empty | Ícone, título, descrição e **uma ação** | Bate com a regra 8 de `docs/PRINCIPIOS-OBJETIVOS.md`. Hoje "Nenhuma demanda ainda." não tem botão; entra com a captura rápida (T6d) |
| Kbd | Tecla em caixa de 20px, fundo suave, `kbd` semântico | Usar `<kbd>` para o atalho F no interruptor e no tooltip. Hoje é texto solto |

Não adotar: a biblioteca inteira (Tailwind, CLI do shadcn, Base UI), cores neutras frias (conflitam com o papel esverdeado), o raio `lg`/`xl` nos contêineres.

## 8. Skills da monday.com: ideias para o funcionamento

Fonte: arquivos das skills do plugin oficial (`mondaycom/monday-claude-cowork-plugin`: `board-setup`, `task-management`, `project-status-report`, `forms-builder`, `docs-collaborator`), lidos em 2026-10-23. O plugin não está instalado e o conector da monday não está ligado, então nenhum quadro real foi examinado. As skills ensinam a usar a API; daí tirei só os **conceitos de como o trabalho é organizado**.

| # | Ideia (conceito da monday) | Como fica no TrilhaJp3 | Quando |
| --- | --- | --- | --- |
| 1 | Estado "Stuck" com o motivo escrito num comentário | **Sinal "Travada" mais um motivo de uma linha**, sem criar um quarto estado (a v1 tem 3). Retomar mostra "Travadas (N)" | R2 |
| 2 | "Atrasada" = prazo vencido **e** estado diferente de Feito; "vence em 24h" como aviso antecipado | Retomar e a Tabela marcam atrasadas e as que vencem em 24h, só na tela, sem notificação. Depende do campo de prazo | R2 |
| 3 | Relatório de status por projeto: distribuição, conclusão, atrasadas, travadas | A linha do cartão "Por projeto" ganha "2 atrasadas · 1 travada". Sem tela nova | R2 |
| 4 | Modelos de quadro por tipo de trabalho (grupos, colunas e itens iniciais) | **Modelos de projeto** (site, aplicativo, migração de e-mails) que já criam as demandas e subtarefas padrão. É o repetido do dia a dia da Moraes CodeVibe | R2 ou R3 |
| 5 | Busca é ordenação por relevância, não filtro: nunca escrever no "mais parecido" | A captura rápida (T6d) avisa de título parecido antes de criar, para não duplicar | T6d |
| 6 | Resumo semanal de andamento | "Feito hoje" ganha "Feito esta semana", reforçando o progresso visível | R2 |
| 7 | Formulário de entrada de pedidos | Fica para quando houver outros usuários e clientes; a captura rápida cobre o Pedro | R4 ou R5 |
| 8 | Documentos dentro do projeto | Notas do projeto. Anexos e comentários já cobrem a v1 | Depois |

O que a leitura **confirmou** do que já fizemos: o "feito" não deve ser adivinhado pelo nome do rótulo (a monday precisa de um fallback por nome porque o `is_done` costuma vir vazio); nós temos 3 estados fixos, então não há essa fragilidade. Também: ordem de colunas estado, responsável, data, prioridade (nossa Tabela já segue) e confirmação em linguagem simples, sem narrar o que o sistema fez.

**Não pegar:** automações (fora da v1; ficam para o n8n), quadros públicos e privados (nosso isolamento é por empresa), widgets de gráfico (o filete segmentado já mostra o progresso).

## Fontes

- [Notion: Views, filters, sorts & groups](https://notion.com/help/views-filters-and-sorts)
- [monday.com: The board views](https://support.monday.com/hc/en-us/articles/360001267945-The-board-views)
- [monday.com community: status colors](https://community.monday.com/t/allow-same-color-be-used-for-different-statuses-within-the-same-status-column/4929?page=2)
- [Atlassian: Jira navigation](https://www.atlassian.com/blog/jira/your-teams-are-getting-better-navigation-in-jira-cloud)
- [Atlassian developer blog: issue view](https://blog.developer.atlassian.com/?p=760)
- [Atlassian: issue view tabs request (JRACLOUD-70127)](https://jira.atlassian.com/browse/JRACLOUD-70127)
- [Trello: views](https://trello.com/views)
- [Atlassian blog: Trello views](https://www.atlassian.com/blog/trello/trellos-views-for-better-team-management)
- [coss ui (antigo Origin UI)](https://coss.com/ui)
- [monday.com: plugin oficial para Claude (skills)](https://github.com/mondaycom/monday-claude-cowork-plugin)
