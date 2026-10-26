---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/(app)/page.tsx"
related_targets: ["src/app/(app)/demandas/page.tsx"]
---

# Surface brief: Retomar e Demandas (casca do app)

Modo: Operate. Alvos: `/` (Retomar) e `/demandas`. Usuário: Pedro, computador e iPad primeiro, celular só consulta.

## Job and audience
Pedro abre o app para retomar o que está "Fazendo". Se não quiser, vai para Demandas. Escala: 5 a 15 projetos, 5 a 30 demandas por projeto, até 10 subtarefas e 5 anexos por demanda.

## Scope and boundaries
- Retomar: bloco Agora (a demanda marcada ou a mais recente em Fazendo, com passo atual e Concluir passo), Em andamento (as demais em Fazendo, sem repetir a Agora) e Feito hoje recolhido.
- Demandas: página própria (ver brief de /demandas).
- Demanda abre em janela sobre a página, fundo levemente fosco. Esc, botão e clique fora fecham. Foco preso na janela e devolvido ao fechar. No celular ocupa a tela inteira.
- Marca, cores, fontes e tokens de `DESIGN.md` não mudam. pt-BR, WCAG 2.1 AA, estado por extenso.

## Direction contract
THESIS: a mesa dividida. Retomar e Demandas são duas leituras da mesma lista; a janela da demanda é o único lugar de edição. Recusa o painel de cartões repetidos e a planilha sem contexto.
OWN-WORLD: papel esverdeado, menta na lateral, filetes de 1px, Geist em tudo (peso 600 e -0.02em nos títulos), verde-floresta apenas no estado Fazendo, no foco e no item atual. Fundo fosco da janela em tom de tinta verde translúcida com desfoque leve, nunca cinza.
STORY: Pedro entende em segundos onde parou, abre a demanda sem perder a lista e troca a visão quando precisa de outra forma de pensar.
FIRST VIEWPORT: lateral de 15rem; título Retomar à esquerda e atalho "Todas as demandas" à direita; abaixo, o bloco Agora com o passo atual em destaque e o botão Concluir passo; depois Em andamento e Feito hoje recolhido. "Nova demanda" fica para a T5.
FORM: mesa dividida, posição 1 da lista ordenada, entregue pelo sorteio (índice 1), seed:e3b973ba9aaf01b0.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
