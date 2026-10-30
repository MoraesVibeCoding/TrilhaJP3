---
name: TrilhaJp3
description: Sistema de gestão da Moraes Coding, calmo e denso, um terminal de BI em verde-mata com um único sinal laranja no passo de agora.
colors:
  ink: "#08180f"
  forest: "#0c2a1e"
  leaf: "#14704a"
  leaf-soft: "#d6ded8"
  mint: "#e6ece7"
  paper: "#f2f2ee"
  gold: "#e3b23c"
  pulse: "#b83300"
  stone: "#5c625e"
  text-soft: "#5c625e"
  line: "#d6ded8"
  card: "#ffffff"
typography:
  display:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
  headline:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  step:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
  count:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5
  small:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
  key:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "10px"
  md: "14px"
  lg: "16px"
  pill: "999px"
spacing:
  unit: "8px"
components:
  nav-item:
    textColor: "{colors.mint}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  nav-item-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mint}"
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
  step-progress-segment-current:
    backgroundColor: "{colors.pulse}"
---

# Design System: TrilhaJp3

## Overview

**Creative North Star: "O Terminal de BI"**

Ferramenta de trabalho diário do Pedro, não vitrine. Marca Moraes Coding, direção B · Gráfico (troca aprovada em 2026-10-28, `tasks/marca-spec.md`; fonte em `docs/brand/moraes-coding/`): a barra lateral é a superfície escura em Mata, como o topo de terminal das peças da marca, e o trabalho fica no Gelo. Linhas finas em vez de caixas, sem sombras e sem gradientes. Um único sinal laranja por tela: o passo atual da demanda Agora.

A informação é escrita por extenso. Estado e prioridade nunca dependem só de cor.

**Key Characteristics:**

- Duas superfícies: Mata na barra lateral, Gelo (ou Mata, no escuro) na área de trabalho.
- Listas e tabelas com filetes de 1px, sem cartões repetidos.
- Space Grotesk em títulos e texto; IBM Plex Mono só em números (datas, contagens, "Passo N de M").
- Modo claro e escuro com os mesmos papéis de cor.
- Modo Foco e modo Completo sobre a mesma página.
- Alvos de toque de 44px e foco sempre visível, no sinal.

## Colors

Tokens de `docs/brand/moraes-coding/tokens.json`, aplicados em `src/styles/tokens.css`. Os nomes `--mcv-*` vêm da marca anterior e continuam (a correspondência está no topo de `tokens.css`); os valores trocam por `data-theme` ou pela preferência do sistema, entre os temas Claro (Gelo) e Escuro (Mata).

### Primary

- **Mata** (`forest`, #0c2a1e): títulos h1 a h3, botão primário, fundo da barra lateral e da faixa do login. No escuro, títulos e botão vão para Névoa e o fundo da página vira Mata.
- **Alta** (`leaf`, #14704a, 5,4:1 no Gelo, 5,1:1 na Névoa): borda do estado "Fazendo", borda de botões ao passar o mouse e sublinhados. Hoje não é cor de texto.

### Secondary

- **Sinal** (`pulse`): Sinal escuro #b83300 no claro (5,3:1 no Gelo), Sinal #ff5a1f no escuro e sobre a Mata (4,9:1). **Uma vez por tela**, como preenchimento: o passo atual da demanda Agora e a barra de hoje do ícone. Também é a cor do anel de foco. O Sinal claro nunca vai sobre o Gelo (2,8:1).
- **Mostarda** (`gold`, #e3b23c): **só preenchimento** com texto Noite (9,3:1). Nunca texto nem borda sobre o Gelo (1,8:1).

### Neutral

- **Noite** (`ink`, #08180f): texto principal; no escuro, superfície de cartão e fundo da barra lateral.
- **Gelo** (`paper`, #f2f2ee): fundo da área de trabalho e da janela da demanda.
- **Névoa** (`mint`, #e6ece7): superfície suave (notas, avisos); no escuro, texto e títulos.
- **Branco** (`card`, #ffffff): botões, campos e emblemas sobre o Gelo.
- **Linha** (`line`, #d6ded8): filetes, bordas e segmentos vazios do progresso. Decorativa (1,2:1): nunca a única pista de um controle.
- **Apoio** (`stone` e `text-soft`, #5c625e, 5,6:1 no Gelo): texto secundário e borda de controle. No escuro, Apoio escuro #9db5a8 na borda e Apoio escuro 2 #b9ccc1 no texto.
- **Véu da janela** (`--mcv-scrim`, Alta a 35% no claro, Noite a 60% no escuro): só no `::backdrop` da janela da demanda; verde de verdade, nunca cinza.

### Named Rules

**The One-Signal Rule.** Fora do logo, o laranja aparece uma vez por tela: o passo atual da demanda Agora. O filete de progresso dos projetos e da janela não leva o sinal.

**The Two-Surfaces Rule.** A barra lateral é sempre a superfície escura: em `src/app/globals.css` ela redefine os tokens para os valores escuros, e as regras de dentro continuam as mesmas nos dois temas.

## Typography

**Display Font:** Space Grotesk (com Helvetica Neue e Arial), pelo `next/font`.
**Body Font:** Space Grotesk.
**Number Font:** IBM Plex Mono (400, 500, 600), só em números: datas e atividade da Retomar, "Passo N de M", contagens da Demandas, do Quadro e dos Projetos. O rótulo ao lado do número fica em Space Grotesk.

**Character:** uma grotesca geométrica com números em mono, como num painel de BI. Títulos em 600 com espaçamento apertado; texto em 400 e 500. Sem itálico (a Space Grotesk não tem itálico real).

### Hierarchy

- **Display** (600, 1.75 a 2.5rem, 1.15): título da página.
- **Headline** (600, 1.25rem, 1.5): títulos de seção (Agora, Em andamento) e título da janela.
- **Body** (400, 1rem, 1.5): conteúdo; medida máxima de 65ch em textos corridos.
- **Step** (600, 1.75rem, 1.2): o passo atual, no bloco Agora e na janela da demanda.
- **Title** (600, 1.125rem, 1.5): nome do app e título da demanda no bloco Agora.
- **Small** (400, 0.875rem, 1.5): projeto, atividade e metadados.
- **Count** (IBM Plex Mono 600, 1.375rem): números das contagens.
- **Label** (600, 0.8125rem): cabeçalhos de coluna, emblemas.

### Named Rules

**The Number-In-Mono Rule.** Número é IBM Plex Mono; palavra é Space Grotesk. Mono nunca vira enfeite "técnico" em texto.

## Layout

Casca em duas colunas no computador e no iPad: barra lateral fixa de 15rem e área de trabalho com máximo de 72rem. Abaixo de 48rem a lateral vira menu sob a barra superior. No modo Foco (a partir de 48rem) a lateral some e o conteúdo centra com máximo de 48rem. Espaçamento em múltiplos de 8px; mais espaço acima do título do que abaixo. A página nunca rola na horizontal: tabelas largas rolam dentro da própria região.

## Elevation & Depth

Plano. A marca Moraes Coding não usa sombras nem gradientes: o token `--mcv-shadow` vale `none`, e a profundidade vem da troca de superfície (Gelo, Névoa e branco; Mata e Noite na barra lateral) e de filetes. O item de navegação atual se destaca pela superfície e pelo peso 600; os avisos que flutuam e o botão flutuante de captura, pela borda. A janela da demanda se separa da página pelo véu `--mcv-scrim` com `backdrop-filter: blur(4px)`, que cumpre função (isola o foco modal), não enfeite.

### Named Rules

**The No-Shadow Rule.** Nenhuma sombra. O único desfoque é o do fundo da janela modal.

## Shapes

Cantos discretos, raios da marca Moraes Coding: 10px em botões e itens, 14px na janela da demanda, 16px (`--mcv-radius-lg`) no botão flutuante de captura do celular e em painéis futuros, 999px em emblemas e nos segmentos de progresso. Bordas de 1px: Linha em divisores e na borda de contêineres e emblemas (janela, cartões, insígnias de estado), que se reconhecem pelo fundo e pelo texto; controles usam `--mcv-control-line`. No celular a janela ocupa a tela inteira, sem borda nem raio.

## Components

### Navigation

Barra lateral em Mata (Noite no escuro), proposta A da troca de marca. Itens de 44px de altura, texto Névoa; o atual vai sobre Noite (Mata no escuro), peso 600, com `aria-current="page"`. O rodapé diz "Moraes Coding". Itens: Retomar, Demandas e Projetos; logo abaixo, o botão Sair no mesmo estilo. No celular, botão de menu com `aria-expanded`.

### Icon buttons (tema, Foco/Completo, menu, fechar)

44px, fundo Cartão, borda Linha, borda Alta ao passar o mouse. Ícones SVG de traço 1.75.

### Buttons

- **Primário** ("Concluir passo"): fundo Mata, texto Gelo, 8px de raio, 44px de altura mínima, peso 600; ao passar o mouse fica em Noite.
- **Secundário** ("Marcar como Agora" / "Tirar de Agora"): fundo Cartão, borda Linha, 44px; borda Alta ao passar o mouse. Com `aria-pressed="true"` fica em Mata, peso 600. Oculto no modo Foco.

### Badges de estado

Pílula com borda Linha. "Fazendo" ganha borda Alta e texto Mata; "Feito" fica em `text-soft`. O texto sempre diz o estado.

### Filete de progresso (StepProgress)

Um traço de 3px por passo, em pílula, com 4px entre eles e largura máxima de 12rem. Vazio em Linha, concluído em Mata. No bloco Agora (`signal`), o passo atual vai no sinal: é o único laranja da tela. É `aria-hidden`: o texto "Passo N de M" ao lado diz o mesmo.

### Retomar: Agora, Em andamento e Feito hoje

Três blocos, nessa ordem, separados por filetes. **Agora**: título da seção em Space Grotesk, a demanda (botão com aparência de link), o projeto em texto suave, o passo atual em Space Grotesk 1,75rem, "Passo N de M", o filete de progresso e o botão "Concluir passo". **Em andamento (N)**: as demais demandas em Fazendo, da atividade mais recente à mais antiga, sem repetir a Agora. **Feito hoje (N)**: grupo recolhido com o que foi concluído no dia; o marcador do `summary` é Mata. Sem demanda marcada, a Agora é uma sugestão (a mais recente) e diz isso em texto. No Foco, só o bloco Agora aparece.

### Faixa de contagens (página Demandas)

Três botões em linha: número grande (IBM Plex Mono 600, 1,375rem) e o estado por extenso, por exemplo "3 Fazendo". Mostram quantas demandas há em cada estado, respeitando os filtros de Projeto e Prioridade. Clicar filtra a tabela por aquele estado (`aria-pressed`); clicar de novo limpa. Selecionado: borda e anel de 1px em tinta, nunca verde. Alvo de 44px.

### Cartão de projeto (visão Por projeto)

Um cartão por projeto, em grade automática pela largura do contêiner (cartões de no mínimo 15rem: 3 colunas no computador, 2 no iPad e no Foco, 1 no celular). Gelo branco, filete de 1px, raio pequeno, sem sombra. Cabeçalho: nome (Space Grotesk 600, 1,125rem), contagens na ordem da faixa e do Quadro, "1 A fazer · 2 Fazendo · 1 Feito", com o número em 1,375rem, e o filete segmentado com "1 de 4 demandas feitas". Mostra as 2 primeiras demandas (título, estado, prioridade, próxima subtarefa; sem texto de enchimento quando não há subtarefa) e "Ver mais N" expande o cartão (`aria-expanded`, nome acessível "Ver mais N demandas de {projeto}"). No modo Foco mostra 5 projetos e diz quantos ficam escondidos. Sem verde: o estado Fazendo usa a mesma insígnia da Tabela. A escolha da visão fica salva, como o filtro.

### Quadro (visão por estado)

Três colunas, A fazer, Fazendo e Feito, a partir de 60rem (o mesmo ponto em que a Tabela vira cartões) e empilhadas abaixo, inclusive no iPad em pé. Cabeçalho da coluna: número em 1,375rem e o estado por extenso, com filete embaixo. Cartão branco com filete de 1px: título (abre a janela), projeto e prioridade, e o menu "Mover para…". Mover é um `select` nativo com só os outros dois estados, alvo de 44px: funciona por teclado, toque e leitor de tela, sem depender de arrastar (alternativa ao arrastar, WCAG 2.5.7). O movimento é anunciado numa região `role="status"` ("Fotos da equipe movida para Feito.") que também aparece como texto à vista, colada ao fim da tela, por 4 segundos. O foco volta ao menu do cartão na coluna nova. Coluna vazia diz "Nenhuma demanda em {estado}." A faixa de contagens some nesta visão, porque as colunas já são os estados. No modo Foco cada coluna mostra 5 cartões e diz quantos ficam escondidos. Sem verde nos cartões.

### Captura rápida (T6d)

Botão primário (Mata, texto Gelo, 44px) na barra do topo no computador, com o texto "Nova demanda" e a tecla `C` como dica; no celular vira um botão flutuante de 56px no canto de baixo à direita, com o texto só para leitor de tela, e o conteúdo ganha folga embaixo para nunca ser coberto. A janela reaproveita a janela da demanda (fundo fosco, foco preso e devolvido): título "Nova demanda", um campo de texto (Enter cria, Esc cancela), Projeto (lembra o último usado) e Prioridade (Média). Título vazio diz "Escreva o título da demanda." num `role="alert"`. Título parecido com outra demanda mostra "Parecida com:" e a lista, e o botão vira "Criar mesmo assim". Desde a T5 a janela grava no banco: ao abrir, busca os projetos reais e os títulos para o aviso de parecida ("Carregando…" enquanto isso; sem projeto, um link para Projetos). Criada, a demanda nasce em A fazer, a janela fecha e uma confirmação "Demanda criada: …" fica à vista por 4 segundos; se não gravar, a janela fica aberta com o título e o erro. O atalho `C` não vale digitando, com modificador nem com outra janela aberta. A tecla da dica (`kbd`) usa raio de 4px e IBM Plex Mono 600 em 0,75rem: a escala "key" e o raio "xs", só para teclas.

### Controles, véu e movimento

Bordas de controles (selects, faixa de contagens, botões de ícone e secundário) usam `--mcv-control-line` (Apoio, 5,6:1 no Gelo, WCAG 1.4.11); a Linha, 1,2:1, fica para divisores e bordas de contêineres e emblemas, que não dependem dela para serem reconhecidos. O véu da janela é o token `--mcv-scrim`: Alta a 35% no claro e Noite a 60% no escuro, para escurecer nos dois temas. O token `--mcv-shadow` vale `none` (Elevation & Depth). Movimento: a janela entra em 180ms (esmaece e sobe 8px); com movimento reduzido só esmaece, em 120ms, e o estado continua legível. O estado pressionado da faixa de contagens usa fundo Névoa e peso 600, nunca verde.

### Interruptor Foco/Completo

Botão de ícone (44px) no cabeçalho, ao lado do tema, com `aria-pressed`. No Completo mostra o alvo (ativar foco); no Foco mostra a grade (ativar completo). Dica "Alternar Foco e Completo (F)", atalho `F` (ignorado ao digitar ou com Ctrl, Cmd e Alt) e aviso a leitores de tela. O modo vive em `data-mode` no `<html>`. Foco: barra lateral escondida, marca no cabeçalho, conteúdo centrado (máx. 48rem), só o bloco Agora em Retomar e, na janela, só o passo atual, Subtarefas e nenhum botão secundário.

### Janela da demanda

Janela centrada (máx. 40rem) sobre a página, fundo Gelo, borda Linha, raio 12px. O fundo da página atrás vira o véu `--mcv-scrim` com `backdrop-filter: blur(4px)`. No celular ocupa a tela inteira. Topo: título em Space Grotesk, botão Fechar, estado e, ao lado, o botão "Marcar como Agora" ou "Tirar de Agora" (oculto no Foco). Depois o **passo atual** (Step) entre filetes, com o filete de progresso e o botão "Concluir passo", que recebe o foco inicial. Abaixo, grupos recolhíveis (Subtarefas aberto; Comentários, Anexos e Histórico fechados), cada um com contagem e marcador Mata. Fecha com `Esc`, botão ou clique fora; o foco fica preso na janela e volta ao ponto de origem. **Endereço (T5b):** abrir a janela troca o endereço para `/demandas/{id}`; fechar, `Esc` ou Voltar do navegador volta ao endereço anterior, e Avançar reabre. No topo, entre o título e Fechar, o link "Abrir em página inteira" (0,875rem, sublinhado Alta, alvo de 44px; no celular desce para baixo do título). A página substitui a janela no histórico. Na lista de Subtarefas o passo atual diz "agora" em texto.

### Demanda em página inteira (T5b)

Rota `/demandas/{id}`, link permanente, para sessões longas (proposta A, escolhida pelo Pedro em 2026-10-25). Topo: caminho "Demandas / {projeto}" (o primeiro é link), título em Display, linha de metadados em `text-soft` 0,875rem (estado, projeto · prioridade · última atividade) com "Marcar como Agora" ou "Tirar de Agora" e "Copiar link" à direita, e um filete. "Copiar link" confirma "Link copiado." na mesma faixa de aviso do Quadro (4 segundos); sem área de transferência, diz que o endereço está na barra do navegador. Corpo em três colunas separadas por filetes verticais de 1px, sem cartões nem sombra: Subtarefas (18rem, numeradas, filete entre os itens, o passo atual em Mata, peso 600 e "agora" por extenso) | Agora (título de seção, o passo em Step 1,75rem, "Passo N de M", filete de progresso, "Concluir passo") e Comentários | Anexos e Histórico (18rem). Tudo aberto, com títulos h2 de 1,25rem, nunca grupos recolhíveis. As colunas seguem a largura da área de conteúdo (container query): 3 com 60rem ou mais, 2 com 32rem ou mais (Anexos e Histórico descem lado a lado), 1 abaixo disso, onde os botões ocupam a própria linha. No Foco ficam só Subtarefas e Agora; some "Marcar como Agora", "Copiar link" fica. Id desconhecido: "Demanda não encontrada." com link para Demandas.

### Editar a demanda e importar do navegador (T5.3)

Propostas A e C, aprovadas pelo Pedro em 2026-10-27 (telas reais em HTML). **Editar:** botão secundário "Editar" na linha de metadados da página inteira, entre "Marcar como Agora" e "Copiar link". Abre o próprio cabeçalho (título e metadados) como formulário, no padrão de Projetos: Cartão com borda Linha e raio md; Título (1,25rem, peso 600) e Descrição na largura toda; Prioridade e Prazo (`input type="date"`) lado a lado; "Cancelar" e "Salvar" à direita. Erro por campo como em Projetos, com o foco no primeiro campo inválido; ao fechar, o foco volta a "Editar" e "Demanda salva." aparece na faixa de aviso. Fora da edição, o prazo entra nos metadados ("Prazo 30 de out.", com o ano só se for outro) e a descrição fica logo abaixo do filete, em medida de 65ch, respeitando as quebras de linha. **Importar:** enquanto houver demandas capturadas só no navegador (antes da T5), Demandas mostra no topo um aviso em Névoa com borda de controle: a frase "N demandas capturadas só neste navegador." em peso 600, a lista com caixas de marcar (todas marcadas, alvo de 44px, filete entre elas), o campo Projeto e "Importar N demandas" (primário); "Descartar as desmarcadas" (secundário) aparece quando alguma está desmarcada. Importadas, somem do navegador, e o aviso "N demandas importadas para {projeto}." fica na faixa de aviso. Sem projeto, aponta para Projetos.

### App instalado (T12)

O app se instala na tela inicial do iPad (Safari) e no computador (Chrome ou Edge) e abre em tela cheia (`display: standalone`), sem modo offline. Ícone: o `mc-app-icone.svg` da marca Moraes Coding (M de cinco barras em Névoa, barra de hoje no Sinal, sobre Mata `#0C2A1E`), o mesmo do favicon `public/icon.svg`. Os PNG saem dele: 192 e 512 com os cantos do desenho, o `maskable` de 512 e o `apple-icon` de 180 quadrados e opacos (o sistema recorta). O fundo de abertura é Gelo `#F2F2EE`. A barra do navegador segue o tema do sistema: Gelo no claro, Mata no escuro. A barra de status do iPad fica no padrão, e o conteúdo nunca passa por baixo dela.

### Tela de entrada (T3)

Rota `/entrar`, fora da casca (proposta B, mesa dividida, escolhida pelo Pedro em 2026-10-26). Faixa à esquerda (2fr, mínimo 18rem, padding 2,5rem) com o ícone e o nome no topo e a frase "Projetos e demandas da Moraes Coding." embaixo, em Display 600, de 1,375 a 1,75rem conforme a largura; à direita, no Gelo, o título "Entrar" (1,25rem) e o formulário até 22rem: rótulos de 0,8125rem peso 600, campos de 44px com borda de controle, botão primário de largura total. No claro a faixa é Mata com texto e ícone em Névoa (a barra de hoje do ícone no Sinal claro); no escuro usa a superfície Noite com filete à direita. Abaixo de 45rem a faixa vira uma barra com ícone e nome e a frase some. O aviso de erro é o mesmo da captura: Noite peso 600 sobre Névoa com borda de controle, nunca vermelho; vazio, fica no DOM (região viva) sem ocupar espaço. Pendente: "Entrando…" com o botão em `text-soft`. O botão Sair fica na barra lateral do app, logo abaixo da navegação, no estilo dos itens dela.

### Projetos (T4)

Rota `/projetos` (proposta A, grupos por estado, escolhida pelo Pedro em 2026-10-27). Cabeçalho da página com "Novo projeto" (botão primário). Abas "Ativos (N)" e "Arquivados (N)": links em pílula, a atual com fundo Cartão, borda Linha e texto Mata. Grupos por estado com título h2 de 1,125rem e a contagem em `text-soft`, filete embaixo; linhas em grade (nome peso 600, prioridade e link em 0,875rem; link em Mata com sublinhado, só o endereço sem `https://`; "Editar" em botão secundário), filete de 1px entre elas. Editar abre o formulário no lugar da linha: Cartão com borda Linha e raio md, grade de 3 colunas (nome 2fr, estado e prioridade), descrição e link na largura toda; erro por campo em Noite peso 600, campo inválido com borda Noite de 2px. "Arquivar" à esquerda, "Cancelar" e "Salvar" à direita. No celular, cada linha empilha nome, prioridade e link com "Editar" à direita, e o formulário vira uma coluna. A casca reserva 6rem no fim da página no celular para o botão flutuante de captura não cobrir o último item.

### Tabelas

Filetes de 1px, cabeçalho em `text-soft` 0.8125rem, primeira coluna como cabeçalho de linha, números tabulares.

## Do's and Don'ts

### Do:

- **Do** usar os tokens `--mcv-*` em vez de valores soltos.
- **Do** escrever estado e prioridade por extenso, com cor só como reforço.
- **Do** manter foco visível (3px no sinal, offset 3px) e alvos de 44px.
- **Do** usar `--mcv-text-soft` para texto secundário pequeno.
- **Do** repetir em texto o que o filete de progresso mostra.

### Don't:

- **Don't** usar cinza puro ou preto puro; os neutros são esverdeados.
- **Don't** repetir cartões iguais como estrutura de página. Exceções: a lista de demandas abaixo de 60rem, onde cada demanda vira um cartão para nunca haver rolagem horizontal, e as visões Por projeto (um cartão por projeto) e Quadro (cartões de demanda em colunas), escolhidas pelo Pedro em 2026-10-23.
- **Don't** usar sombra, gradiente ou desfoque como enfeite.
- **Don't** usar outra família além da Space Grotesk e da IBM Plex Mono, nem mono fora de números.
- **Don't** usar o sinal laranja mais de uma vez por tela, nem como texto ou borda.
- **Don't** usar Apoio em texto pequeno.
