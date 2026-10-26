---
version: 1
slug: "src-app-demandas-id-page-tsx"
primary_target: "src/app/(app)/demandas/[id]/page.tsx"
related_targets: ["src/components/demand-page.tsx"]
---

# Surface brief: Demanda em página inteira

Modo: Operate. Rota `/demandas/[id]`, link permanente. Proposta A (três colunas) escolhida pelo Pedro em 2026-10-25. Spec: `tasks/t5b-spec.md`.

## Job and audience
Pedro em sessão longa de planejamento no computador ou iPad: precisa ver subtarefas, o passo atual, comentários, anexos e histórico ao mesmo tempo, sem abrir e fechar grupos. Escala: até 10 subtarefas, 5 anexos, dezenas de comentários e eventos.

## Scope and boundaries
- Topo: caminho "Demandas / {projeto}", título (h1), estado, projeto, prioridade, última atividade, "Marcar como Agora" ou "Tirar de Agora", "Copiar link".
- Colunas pela largura da área de conteúdo (container query, spec 3.2): três com 60rem ou mais; duas com 32rem ou mais (Subtarefas e Agora com Comentários; Anexos e Histórico embaixo); uma abaixo disso.
- Foco: só Subtarefas e Agora; some Marcar como Agora, Copiar link fica (spec 2.9). Completo: tudo.
- Fora: escrever comentários (T9), anexar (T11), editar campos. Marca, cores e fontes de DESIGN.md não mudam.

## Direction contract
THESIS: a mesa de trabalho da demanda: tudo aberto lado a lado, o passo atual no centro. Recusa a janela esticada com grupos recolhidos e a pilha de abas.
OWN-WORLD: papel esverdeado, filetes verticais de 1px separando as colunas, Geist em tudo (600 e -0.02em no título e no passo), verde-floresta só no passo atual, no item atual da lista e no botão primário. Sem cartões, sem sombra.
STORY: Pedro lê o passo, conclui, confere o que falta à esquerda e o contexto à direita, e copia o link para voltar depois.
FIRST VIEWPORT: caminho e h1 no topo, metadados numa linha com os dois botões à direita; filete; esquerda (18rem) Subtarefas numeradas com o atual em Floresta; centro, seção Agora com o passo em 1,75rem, "Passo N de M", filete de progresso e "Concluir passo", depois Comentários; direita (18rem) Anexos e Histórico.
FORM: três colunas (mesa dividida), posição 4 da lista ordenada, entregue pelo sorteio (índice 4), seed:def2c418e855cc39.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
