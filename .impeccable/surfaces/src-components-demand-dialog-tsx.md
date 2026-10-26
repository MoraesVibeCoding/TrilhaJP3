---
version: 1
slug: "src-components-demand-dialog-tsx"
primary_target: "src/components/demand-dialog.tsx"
related_targets: []
---

# Surface brief: Janela da demanda

Modo: Operate. Abre sobre Retomar e Demandas. Proposta A aprovada em 2026-10-22: próxima ação em destaque.

## Job and audience
Pedro abre uma demanda para saber o que fazer agora e fazer. Escala: até 10 subtarefas e 5 anexos por demanda.

## Scope and boundaries
- Janela sobre a página com fundo levemente fosco (desfoque leve, tinta verde translúcida). Fecha com Esc, botão ou clique fora. Foco preso na janela e devolvido ao ponto de origem. No celular ocupa a tela inteira.
- Topo: título, estado e a próxima subtarefa em destaque com o botão "Concluir passo".
- Abaixo, grupos recolhíveis: Subtarefas, Comentários, Anexos, Histórico. Cada um com contagem.
- Modo Foco mostra o passo atual e Subtarefas; Completo mostra tudo (docs/PRINCIPIOS-OBJETIVOS.md 5b). O botão Marcar como Agora ou Tirar de Agora fica no topo e some no Foco.
- "Abrir em página inteira" (T5b) está adiado. Marca, cores e fontes de DESIGN.md não mudam.

## Direction contract
THESIS: a janela responde "o que faço agora?" antes de qualquer outra coisa; todo o resto é contexto recolhido. Recusa o formulário longo de campos.
OWN-WORLD: papel esverdeado sobre fundo de tinta verde translúcida e desfoque leve; filetes de 1px; Geist em tudo (peso 600 e -0.02em no título); verde-floresta no passo atual e no foco. Sem sombra decorativa.
STORY: Pedro lê o passo, conclui ou abre um grupo, e fecha sem perder a lista atrás.
FIRST VIEWPORT: janela centrada (máx. 40rem), título e estado no topo, bloco "Agora" com a próxima subtarefa e o botão "Concluir passo", e abaixo quatro grupos com contagem, Subtarefas aberto.
FORM: próxima ação em destaque, posição 7 da lista ordenada, entregue pelo sorteio (índice 7), seed:a0d89fd639efd23a.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
