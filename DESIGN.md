---
name: TrilhaJp3
description: Sistema de gestão da Moraes CodeVibe, calmo e denso, verde-floresta discreto sobre papel claro ou floresta escura.
colors:
  ink: "#0f1f14"
  forest: "#1b4d2e"
  leaf: "#2f7d4b"
  leaf-soft: "#a8c69a"
  mint: "#edf4e7"
  paper: "#f8faf5"
  gold: "#d4892a"
  pulse: "#a6f26b"
  stone: "#7c8a76"
  text-soft: "#526350"
  line: "#d5dfcc"
  card: "#ffffff"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  step:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
  count:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5
  small:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
  key:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  pill: "999px"
spacing:
  unit: "8px"
components:
  nav-item:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  nav-item-current:
    backgroundColor: "{colors.card}"
    textColor: "{colors.forest}"
  icon-button:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: "44px"
  badge:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  button-secondary-pressed:
    textColor: "{colors.forest}"
  demand-dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    width: "40rem"
  step-progress-segment:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.pill}"
    height: "3px"
  step-progress-segment-filled:
    backgroundColor: "{colors.forest}"
---

# Design System: TrilhaJp3

## Overview

**Creative North Star: "O Caderno de Obra"**

Ferramenta de trabalho diário do Pedro, não vitrine. A superfície é calma e densa: papel claro (ou floresta escura), linhas finas em vez de caixas, e o verde da marca só onde há ação ou destaque. A marca Moraes CodeVibe aparece nos detalhes: o título em Geist, o ícone, o verde-floresta no item atual.

A informação é escrita por extenso. Estado e prioridade nunca dependem só de cor.

**Key Characteristics:**

- Neutros esverdeados (papel, menta, linha), nunca cinza puro.
- Listas e tabelas com filetes de 1px, sem cartões repetidos.
- Uma só família (Geist): a hierarquia vem de peso, tamanho e espaçamento entre letras, não de troca de fonte.
- Modo claro e escuro com os mesmos papéis de cor.
- Modo Foco e modo Completo sobre a mesma página.
- Alvos de toque de 44px e foco sempre visível.

## Colors

Marca V2 (evolução decidida por Pedro em 2026-10-23, valores em `docs/brand/evolucao/tokens-v2.json`): neutros da marca, um verde de ação e dois acentos com regra de uso. Os valores do modo escuro estão em `src/styles/tokens.css` e trocam por `data-theme` ou pela preferência do sistema.

### Primary

- **Floresta** (#1b4d2e): item de navegação atual, estado "Fazendo", foco, item atual (passo e botão "Marcar como Agora" ativo), botão primário e marcador do `summary`. No escuro vira #a8c69a.
- **Folha** (#2f7d4b, 4,81:1 no papel): borda do estado "Fazendo", borda de botões ao passar o mouse e sublinhados. Pode ser texto sobre papel e cartão, mas não sobre a Neblina (4,497:1); hoje não é usada como cor de texto.

### Secondary

- **Âmbar** (#d4892a): **só preenchimento** com texto Tinta (6,04:1). Nunca texto nem borda sobre o papel claro (2,7:1). A nota de dados de demonstração usa borda tracejada em `text-soft`, não mais o âmbar.
- **Pulso** (#a6f26b): significa **"Claude está trabalhando"**, e só isso. Só sobre fundo escuro (Floresta 7,2:1, Tinta 12,7:1) ou com contorno Floresta de 2,5 px; sobre o papel claro dá 1,29:1. O ponto do ícone da marca é o único uso hoje; o indicador de IA entra com o campo Executor.

### Neutral

- **Tinta** (#0f1f14): texto principal, fundo escuro e fundo do botão primário ao passar o mouse.
- **Papel** (#f8faf5): fundo da área de trabalho e da janela da demanda. No escuro o fundo é a Tinta.
- **Neblina** (#edf4e7): barra lateral e notas.
- **Cartão** (#ffffff): botões, item atual e emblemas.
- **Linha** (#d5dfcc): filetes, bordas e segmentos vazios do progresso.
- **Pedra** (#7c8a76): bordas e itens indisponíveis; **não** serve para texto pequeno (3,5:1). O texto secundário usa o token `--mcv-text-soft` (#526350 no claro, 4,9:1 ou mais), que no escuro volta a Pedra. Em `text-soft` vão projeto, metadados, contagens, cabeçalhos de coluna e "Projetos em breve".
- **Tinta do fundo da janela** (`rgb(31 74 44 / 0.4)`): valor solto, só no `::backdrop` da janela da demanda; verde com croma visível, nunca cinza. Não é token e não vira cor de superfície.

### Named Rules

**The Rare Green Rule.** O verde de ação cobre menos de 10% da tela. Se tudo é verde, nada é destaque.

**The Green-Means-Now Rule.** Verde-floresta só aparece em: estado Fazendo, foco, item atual, botão primário e marcador do `summary`. Nunca em decoração, fundo de bloco ou texto corrido.

## Typography

**Display Font:** Geist (com system-ui)
**Body Font:** Geist (com system-ui)
**Label/Mono Font:** monoespaçada do sistema, reservada a código e dados; ainda sem uso na interface. Exceção ao kit de marca original (Fraunces, Inter, JetBrains Mono), decidida pelo Pedro em 2026-10-22.

**Character:** uma só sans moderna e neutra, em duas camadas de peso: títulos em 600 com espaçamento apertado e texto em 400 e 500. A hierarquia vem de tamanho e peso, nunca de trocar de família; o conteúdo fala primeiro.

### Hierarchy

- **Display** (600, 1.75 a 2.5rem, 1.15): título da página.
- **Headline** (600, 1.25rem, 1.5): títulos de seção (Agora, Em andamento) e título da janela.
- **Body** (400, 1rem, 1.5): conteúdo; medida máxima de 65ch em textos corridos.
- **Step** (600, 1.75rem, 1.2, Geist): o passo atual, no bloco Agora e na janela da demanda.
- **Title** (600, 1.125rem, 1.5): nome da marca na barra superior e título da demanda no bloco Agora.
- **Small** (400, 0.875rem, 1.5): projeto, atividade, contagem de passos e metadados.
- **Label** (600, 0.8125rem): cabeçalhos de coluna, emblemas.

### Named Rules

**The One-Family Rule.** Só Geist. Títulos e o passo atual em peso 600 com espaçamento entre letras de -0.02em; o resto em 400 e 500. Nunca misturar outra família.

## Layout

Casca em duas colunas no computador e no iPad: barra lateral fixa de 15rem e área de trabalho com máximo de 72rem. Abaixo de 48rem a lateral vira menu sob a barra superior. No modo Foco (a partir de 48rem) a lateral some e o conteúdo centra com máximo de 48rem. Espaçamento em múltiplos de 8px; mais espaço acima do título do que abaixo. A página nunca rola na horizontal: tabelas largas rolam dentro da própria região.

## Elevation & Depth

Plano por padrão. A profundidade vem de camadas tonais (papel, menta, cartão) e filetes. Há uma só sombra, o token `--mcv-shadow` (`0 1px 2px rgb(22 36 26 / 0.12)` no claro), e ela marca o que fica por cima ou é atual: o item de navegação atual, os avisos de confirmação que flutuam no fim da tela (Quadro, captura rápida, Copiar link) e o botão flutuante de captura no celular. A janela da demanda não tem sombra: o que a separa da página é o fundo em tinta verde translúcida com `backdrop-filter: blur(4px)`, que cumpre função (isola o foco modal), não enfeite.

### Named Rules

**The Flat-By-Default Rule.** A sombra só indica o item atual ou o que flutua sobre o conteúdo, nunca decora. O único desfoque é o do fundo da janela modal.

## Shapes

Cantos suaves: 8px em botões e itens, 12px na janela da demanda, 20px (`--mcv-radius-lg`) no botão flutuante de captura do celular e em painéis futuros, 999px em emblemas e nos segmentos de progresso. Bordas de 1px: Linha em divisores e na borda de contêineres e emblemas (janela, cartões, insígnias de estado), que se reconhecem pelo fundo e pelo texto; controles usam `--mcv-control-line`. No celular a janela ocupa a tela inteira, sem borda nem raio.

## Components

### Navigation

Barra lateral em Menta. Itens de 44px de altura, texto Tinta; o atual vai sobre Cartão, em Verde Floresta e peso 600, com `aria-current="page"`. Itens: Retomar, Demandas e "Projetos" seguido de "em breve" (0.8125rem), indisponível em `text-soft` com `aria-disabled` e cursor `not-allowed`. No celular, botão de menu com `aria-expanded`.

### Icon buttons (tema, Foco/Completo, menu, fechar)

44px, fundo Cartão, borda Linha, borda Verde Folha ao passar o mouse. Ícones SVG de traço 1.75.

### Buttons

- **Primário** ("Concluir passo"): fundo Verde Floresta, texto Papel, 8px de raio, 44px de altura mínima, peso 600; ao passar o mouse fica em Tinta Verde.
- **Secundário** ("Marcar como Agora" / "Tirar de Agora"): fundo Cartão, borda Linha, 44px; borda Verde Folha ao passar o mouse. Com `aria-pressed="true"` fica em Verde Floresta, peso 600. Oculto no modo Foco.

### Badges de estado

Pílula com borda Linha. "Fazendo" ganha borda Verde Folha e texto Verde Floresta; "Feito" fica em `text-soft`. O texto sempre diz o estado.

### Filete de progresso (StepProgress)

Um traço de 3px por passo, em pílula, com 4px entre eles e largura máxima de 12rem. Vazio em Linha, concluído em Verde Floresta. É `aria-hidden`: o texto "Passo N de M" ao lado diz o mesmo.

### Retomar: Agora, Em andamento e Feito hoje

Três blocos, nessa ordem, separados por filetes. **Agora**: título da seção em Geist, a demanda (botão com aparência de link), o projeto em texto suave, o passo atual em Geist 1,75rem, "Passo N de M", o filete de progresso e o botão "Concluir passo". **Em andamento (N)**: as demais demandas em Fazendo, da atividade mais recente à mais antiga, sem repetir a Agora. **Feito hoje (N)**: grupo recolhido com o que foi concluído no dia; o marcador do `summary` é Verde Floresta. Sem demanda marcada, a Agora é uma sugestão (a mais recente) e diz isso em texto. No Foco, só o bloco Agora aparece.

### Faixa de contagens (página Demandas)

Três botões em linha: número grande (Geist 600, 1,375rem) e o estado por extenso, por exemplo "3 Fazendo". Mostram quantas demandas há em cada estado, respeitando os filtros de Projeto e Prioridade. Clicar filtra a tabela por aquele estado (`aria-pressed`); clicar de novo limpa. Selecionado: borda e anel de 1px em tinta, nunca verde. Alvo de 44px.

### Cartão de projeto (visão Por projeto)

Um cartão por projeto, em grade automática pela largura do contêiner (cartões de no mínimo 15rem: 3 colunas no computador, 2 no iPad e no Foco, 1 no celular). Papel branco, filete de 1px, raio pequeno, sem sombra. Cabeçalho: nome (Geist 600, 1,125rem), contagens na ordem da faixa e do Quadro, "1 A fazer · 2 Fazendo · 1 Feito", com o número em 1,375rem, e o filete segmentado com "1 de 4 demandas feitas". Mostra as 2 primeiras demandas (título, estado, prioridade, próxima subtarefa; sem texto de enchimento quando não há subtarefa) e "Ver mais N" expande o cartão (`aria-expanded`, nome acessível "Ver mais N demandas de {projeto}"). No modo Foco mostra 5 projetos e diz quantos ficam escondidos. Sem verde: o estado Fazendo usa a mesma insígnia da Tabela. A escolha da visão fica salva, como o filtro.

### Quadro (visão por estado)

Três colunas, A fazer, Fazendo e Feito, a partir de 60rem (o mesmo ponto em que a Tabela vira cartões) e empilhadas abaixo, inclusive no iPad em pé. Cabeçalho da coluna: número em 1,375rem e o estado por extenso, com filete embaixo. Cartão branco com filete de 1px: título (abre a janela), projeto e prioridade, e o menu "Mover para…". Mover é um `select` nativo com só os outros dois estados, alvo de 44px: funciona por teclado, toque e leitor de tela, sem depender de arrastar (alternativa ao arrastar, WCAG 2.5.7). O movimento é anunciado numa região `role="status"` ("Fotos da equipe movida para Feito.") que também aparece como texto à vista, colada ao fim da tela, por 4 segundos. O foco volta ao menu do cartão na coluna nova. Coluna vazia diz "Nenhuma demanda em {estado}." A faixa de contagens some nesta visão, porque as colunas já são os estados. No modo Foco cada coluna mostra 5 cartões e diz quantos ficam escondidos. Sem verde nos cartões.

### Captura rápida (T6d)

Botão primário (Floresta, texto Papel, 44px) na barra do topo no computador, com o texto "Nova demanda" e a tecla `C` como dica; no celular vira um botão flutuante de 56px no canto de baixo à direita, com o texto só para leitor de tela, e o conteúdo ganha folga embaixo para nunca ser coberto. A janela reaproveita a janela da demanda (fundo fosco, foco preso e devolvido): título "Nova demanda", um campo de texto (Enter cria, Esc cancela), Projeto (lembra o último usado) e Prioridade (Média). Título vazio diz "Escreva o título da demanda." num `role="alert"`. Título parecido com outra demanda mostra "Parecida com:" e a lista, e o botão vira "Criar mesmo assim". Criada, a demanda nasce em A fazer, a janela fecha e uma confirmação "Demanda criada: …" fica à vista por 4 segundos. O atalho `C` não vale digitando, com modificador nem com outra janela aberta. A tecla da dica (`kbd`) usa raio de 4px e Geist 600 em 0,75rem: a escala "key" e o raio "xs", só para teclas.

### Controles, véu e movimento

Bordas de controles (selects, faixa de contagens, botões de ícone e secundário) usam `--mcv-control-line` (Pedra, 3,5:1 no papel, WCAG 1.4.11); a Linha, 1,3:1, fica para divisores e bordas de contêineres e emblemas, que não dependem dela para serem reconhecidos. O véu da janela é o token `--mcv-scrim`: tinta verde a 40% no claro e quase preto esverdeado a 60% no escuro, para escurecer nos dois temas. A única sombra é o token `--mcv-shadow` (usos em Elevation & Depth). Movimento: a janela entra em 180ms (esmaece e sobe 8px); com movimento reduzido só esmaece, em 120ms, e o estado continua legível. O estado pressionado da faixa de contagens usa fundo Menta e peso 600, nunca verde.

### Interruptor Foco/Completo

Botão de ícone (44px) no cabeçalho, ao lado do tema, com `aria-pressed`. No Completo mostra o alvo (ativar foco); no Foco mostra a grade (ativar completo). Dica "Alternar Foco e Completo (F)", atalho `F` (ignorado ao digitar ou com Ctrl, Cmd e Alt) e aviso a leitores de tela. O modo vive em `data-mode` no `<html>`. Foco: barra lateral escondida, marca no cabeçalho, conteúdo centrado (máx. 48rem), só o bloco Agora em Retomar e, na janela, só o passo atual, Subtarefas e nenhum botão secundário.

### Janela da demanda

Janela centrada (máx. 40rem) sobre a página, fundo Papel, borda Linha, raio 12px. O fundo da página atrás vira tinta verde translúcida (`rgb(31 74 44 / 0.4)`) com `backdrop-filter: blur(4px)`. No celular ocupa a tela inteira. Topo: título em Geist, botão Fechar, estado e, ao lado, o botão "Marcar como Agora" ou "Tirar de Agora" (oculto no Foco). Depois o **passo atual** (Step) entre filetes, com o filete de progresso e o botão "Concluir passo", que recebe o foco inicial. Abaixo, grupos recolhíveis (Subtarefas aberto; Comentários, Anexos e Histórico fechados), cada um com contagem e marcador Verde Floresta. Fecha com `Esc`, botão ou clique fora; o foco fica preso na janela e volta ao ponto de origem. **Endereço (T5b):** abrir a janela troca o endereço para `/demandas/{id}`; fechar, `Esc` ou Voltar do navegador volta ao endereço anterior, e Avançar reabre. No topo, entre o título e Fechar, o link "Abrir em página inteira" (0,875rem, sublinhado Folha, alvo de 44px; no celular desce para baixo do título). A página substitui a janela no histórico. Na lista de Subtarefas o passo atual diz "agora" em texto.

### Demanda em página inteira (T5b)

Rota `/demandas/{id}`, link permanente, para sessões longas (proposta A, escolhida pelo Pedro em 2026-10-25). Topo: caminho "Demandas / {projeto}" (o primeiro é link), título em Display, linha de metadados em `text-soft` 0,875rem (estado, projeto · prioridade · última atividade) com "Marcar como Agora" ou "Tirar de Agora" e "Copiar link" à direita, e um filete. "Copiar link" confirma "Link copiado." na mesma faixa de aviso do Quadro (4 segundos); sem área de transferência, diz que o endereço está na barra do navegador. Corpo em três colunas separadas por filetes verticais de 1px, sem cartões nem sombra: Subtarefas (18rem, numeradas, filete entre os itens, o passo atual em Verde Floresta, peso 600 e "agora" por extenso) | Agora (título de seção, o passo em Step 1,75rem, "Passo N de M", filete de progresso, "Concluir passo") e Comentários | Anexos e Histórico (18rem). Tudo aberto, com títulos h2 de 1,25rem, nunca grupos recolhíveis. As colunas seguem a largura da área de conteúdo (container query): 3 com 60rem ou mais, 2 com 32rem ou mais (Anexos e Histórico descem lado a lado), 1 abaixo disso, onde os botões ocupam a própria linha. No Foco ficam só Subtarefas e Agora; some "Marcar como Agora", "Copiar link" fica. Id desconhecido: "Demanda não encontrada." com link para Demandas.

### App instalado (T12)

O app se instala na tela inicial do iPad (Safari) e no computador (Chrome ou Edge) e abre em tela cheia (`display: standalone`), sem modo offline. Ícone: proposta A, escolhida pelo Pedro em 2026-10-26: o desenho da marca V2 (M em Neblina, pulso lime) sobre Floresta `#1B4D2E`, o mesmo do favicon. Os PNG saem de `docs/brand/evolucao/logo/icon-on-forest.svg`: 192, 512 e o `apple-icon` de 180 com o desenho a 72% da largura; o `maskable` de 512 a 58%, dentro dos 80% centrais. O fundo de abertura é Papel `#F8FAF5`. A barra do navegador segue o tema do sistema: Papel no claro, Tinta `#0F1F14` no escuro. A barra de status do iPad fica no padrão, e o conteúdo nunca passa por baixo dela.

### Tela de entrada (T3)

Rota `/entrar`, fora da casca (proposta B, mesa dividida, escolhida pelo Pedro em 2026-10-26). Faixa à esquerda (2fr, mínimo 18rem, padding 2,5rem) com o ícone e o nome no topo e a frase "Projetos e demandas da Moraes CodeVibe." embaixo, em Display 600, de 1,375 a 1,75rem conforme a largura; à direita, no Papel, o título "Entrar" (1,25rem) e o formulário até 22rem: rótulos de 0,8125rem peso 600, campos de 44px com borda de controle, botão primário de largura total. No claro a faixa é Floresta com texto e ícone em Neblina (o ícone "sobre floresta", Pulso sem contorno); no escuro usa a superfície da barra lateral (Neblina escura) com filete à direita, porque o Floresta do escuro é verde claro. Abaixo de 45rem a faixa vira uma barra com ícone e nome e a frase some. O aviso de erro é o mesmo da captura: Tinta peso 600 sobre Neblina com borda de controle, nunca vermelho; vazio, fica no DOM (região viva) sem ocupar espaço. Pendente: "Entrando…" com o botão em `text-soft`. O botão Sair fica na barra lateral do app, logo abaixo da navegação, no estilo dos itens dela.

### Tabelas

Filetes de 1px, cabeçalho em `text-soft` 0.8125rem, primeira coluna como cabeçalho de linha, números tabulares.

## Do's and Don'ts

### Do:

- **Do** usar os tokens `--mcv-*` em vez de valores soltos.
- **Do** escrever estado e prioridade por extenso, com cor só como reforço.
- **Do** manter foco visível (2px Verde Floresta, offset 2px) e alvos de 44px.
- **Do** usar `--mcv-text-soft` para texto secundário pequeno.
- **Do** repetir em texto o que o filete de progresso mostra.

### Don't:

- **Don't** usar cinza puro ou preto puro; os neutros são esverdeados.
- **Don't** repetir cartões iguais como estrutura de página. Exceções: a lista de demandas abaixo de 60rem, onde cada demanda vira um cartão para nunca haver rolagem horizontal, e as visões Por projeto (um cartão por projeto) e Quadro (cartões de demanda em colunas), escolhidas pelo Pedro em 2026-10-23.
- **Don't** usar sombra, gradiente ou desfoque como enfeite.
- **Don't** misturar outra família tipográfica com a Geist.
- **Don't** usar Verde Floresta fora de estado Fazendo, foco, item atual, botão primário e marcador.
- **Don't** usar Pedra em texto pequeno.
