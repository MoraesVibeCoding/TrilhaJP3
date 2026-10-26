---
version: 1
slug: "src-app-demandas-page-tsx"
primary_target: "src/app/(app)/demandas/page.tsx"
related_targets: []
---

# Surface brief: Demandas (visão Tabela)

Modo: Operate. Alvo: `/demandas`. Versão A aprovada em 2026-10-22 (faixa de contagens como filtro de estado), com tabela no computador e cartões abaixo de 60rem (adaptação mantida da proposta B).

## Job and audience
Pedro varre e planeja muitas demandas (5 a 30 por projeto, 5 a 15 projetos). Computador e iPad primeiro.

## Scope and boundaries
- Seletor de visões no topo, um grupo de botões com `aria-pressed` (Tabela, Por projeto, Quadro); a escolha fica salva.
- Por projeto (T6b, proposta B aprovada em 2026-10-23): um cartão por projeto com contagens A fazer, Fazendo, Feito, progresso "1 de 4 demandas feitas" e as 2 primeiras demandas (título, estado, prioridade, próxima subtarefa); "Ver mais N demandas de {projeto}" expande. Sem "Sem subtarefas" em item sem subtarefa.
- Quadro (T6c, proposta A aprovada em 2026-10-23): colunas A fazer, Fazendo, Feito; cada cartão tem o menu "Mover para…" (select nativo, sem arrastar). 3 colunas a partir de 60rem, empilhadas abaixo. A confirmação do movimento fica à vista por 4 s e é anunciada. A faixa de contagens some nesta visão.
- Estado: faixa de contagens (botões com aria-pressed, contagens seguem Projeto e Prioridade). Projeto e Prioridade: selects nativos. "Ordenar por" aparece abaixo de 60rem na Tabela e em qualquer largura em Por projeto e Quadro. Ordenação clicando no cabeçalho da coluna, com estado de ordenação anunciado. Filtros e ordem lembrados entre visitas.
- Clicar numa linha ou cartão abre a janela da demanda existente.
- Captura rápida (T6d, proposta B aprovada em 2026-10-23): botão "Nova demanda" na barra (flutuante no celular) e tecla `C`; janela de um campo, Enter cria, aviso "Parecida com:" antes de duplicar.
- Abaixo de 60rem cada linha vira cartão: título, estado, projeto, prioridade, atividade e próxima subtarefa.
- Foco mostra só as 5 primeiras (linhas da Tabela, cartões de cada coluna do Quadro, projetos de Por projeto) e diz quantas escondeu. Na Tabela, no Quadro e em Por projeto o texto é "Mostrando as 5 primeiras de N" (ou "os 5 primeiros" para projetos).
- Marca V2 (2026-10-23), cores e fontes de DESIGN.md; o Pulso lime não aparece nesta página. Dados de demonstração rotulados.

## Direction contract
THESIS: uma só lista de demandas, duas apresentações do mesmo dado: tabela quando há largura, cartão quando não há; nunca rolagem horizontal. Recusa a planilha com colunas escondidas.
OWN-WORLD: papel esverdeado, filetes de 1px, estado escrito por extenso em pílula, Geist em tudo (peso 600 e -0.02em nos títulos), cabeçalhos de coluna em tom suave AA, cartões com borda de 1px e raio de 12px, verde-floresta só no estado Fazendo, no foco e no cabeçalho ordenado ativo.
STORY: Pedro filtra, ordena, encontra a demanda e a abre numa janela, sem perder o filtro ao voltar.
FIRST VIEWPORT: título Demandas, seletor de visões, faixa de contagens (A fazer, Fazendo, Feito) como filtro de estado e selects de Projeto e Prioridade na mesma linha, e a tabela densa com cabeçalho Demanda, Projeto, Estado, Prioridade, Atividade, ordenada por prioridade.
FORM: tabela que vira cartões, posição 7 da lista ordenada, entregue pelo sorteio (índice 7), seed:c4ab1b3fd53ab87d.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
