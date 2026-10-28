---
name: Trilha JP3
description: Sistema de gestão (Trilha JP3) com a marca Moraes Coding, calmo e denso, verde-mata sobre Gelo ou Mata escura, com um sinal laranja no número que importa.
colors:
  ink: "#08180F"
  forest: "#0C2A1E"
  leaf: "#14704A"
  leaf-soft: "#D6DED8"
  mint: "#E6ECE7"
  paper: "#F2F2EE"
  gold: "#E3B23C"
  stone: "#5C625E"
  text-soft: "#5C625E"
  line: "#D6DED8"
  card: "#FFFFFF"
  alta: "#14704A"
  alta-hover: "#0C2A1E"
  on-alta: "#F2F2EE"
  destaque: "#B83300"
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
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "6px"
  md: "12px"
  lg: "12px"
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
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: "44px"
  badge:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  button-primary:
    backgroundColor: "{colors.alta}"
    textColor: "{colors.on-alta}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.alta-hover}"
  button-secondary:
    backgroundColor: "transparent"
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
  step-count:
    textColor: "{colors.destaque}"
---

# Design System: Trilha JP3

## Overview

**Creative North Star: "O Caderno de Obra", com a marca Moraes Coding**

Ferramenta de trabalho diário do Pedro, não vitrine. A superfície é calma e densa: Gelo no claro (ou Mata no escuro), linhas finas em vez de caixas, e cor só onde há ação ou o número que importa. A marca é a da empresa cliente, hoje a Moraes Coding, e segue o design system dela (artifact `CeaPqHJ1X5V61mPWYFZnTN`, aprovado em `tasks/tm-spec.md`): tokens semânticos com tema claro e escuro, Space Grotesk e IBM Plex Mono, sem sombras nem gradientes, foco de 3px em laranja e o laranja (destaque) uma vez por tela.

A informação é escrita por extenso. Estado e prioridade nunca dependem só de cor.

**Key Characteristics:**

- Neutros do design system (Gelo, Névoa, Noite, Mata), nunca cinza puro.
- Listas e tabelas com filetes de 1px, sem cartões repetidos.
- Duas famílias com papéis fixos: Space Grotesk no texto e títulos; IBM Plex Mono em números, datas, contagens, cabeçalhos de tabela, selos e teclas.
- Um sinal laranja por tela, no número que importa.
- Modo claro e escuro com os mesmos papéis de cor.
- Modo Foco e modo Completo sobre a mesma página.
- Alvos de toque de 44px e foco sempre visível.

## Colors

Tokens do design system Moraes Coding (fatia 1 da tarefa de marca, 2026-10-27). Os nomes `--mcv-*` do CSS apontam para os tokens semânticos do design system; os valores dos dois temas ficam em `src/styles/tokens.css` e trocam por `data-theme` ou pela preferência do sistema. O contraste de cada par usado é verificado em `src/styles/contrast.test.ts`.

| Token do app                    | Token do design system           | Claro                                | Escuro        |
| ------------------------------- | -------------------------------- | ------------------------------------ | ------------- |
| `paper`                         | `fundo`                          | Gelo #F2F2EE                         | Mata #0C2A1E  |
| `card`                          | `superficie`                     | branco #FFFFFF                       | Noite #08180F |
| `mint`                          | `superficie-suave`               | Névoa #E6ECE7                        | Noite #08180F |
| `ink`                           | `texto`                          | Noite #08180F                        | Névoa #E6ECE7 |
| `forest`                        | `texto-titulo`                   | Mata #0C2A1E                         | Névoa #E6ECE7 |
| `text-soft`                     | `texto-apoio`                    | #5C625E                              | #B9CCC1       |
| `line`                          | `borda` (decorativa)             | #D6DED8                              | #24412F       |
| `stone`, `control-line`         | `borda-controle`                 | #5C625E                              | #9DB5A8       |
| `leaf`                          | links, sublinhados, selo Fazendo | Alta #14704A                         | #9DB5A8       |
| `alta`, `alta-hover`, `on-alta` | botão `alta`                     | Alta #14704A, hover Mata, texto Gelo | o mesmo       |
| `destaque`, `focus`             | `destaque`, `foco`               | Sinal escuro #B83300                 | Sinal #FF5A1F |
| `gold`                          | `atencao`                        | Mostarda #E3B23C, só preenchimento   | o mesmo       |

### Named Rules

**The One-Signal Rule.** O laranja (`destaque`) aparece uma vez por tela, no número que importa: "Passo N de M" no bloco Agora (Retomar, janela e página da demanda) e a contagem de Fazendo em Demandas (faixa de contagens e coluna do Quadro). Projetos e a entrada não têm laranja. O anel de foco também é laranja, mas é transitório e não conta.

**Cores proibidas como texto.** Sinal claro (#FF5A1F) sobre Gelo (2,8:1) e Mostarda sobre Gelo (1,8:1). Alta é cor de link, sublinhado, borda e preenchimento de botão, não de texto corrido. Sem azul nem roxo. O Pulso lime da marca antiga saiu do app.

## Typography

**Display e corpo:** Space Grotesk (`next/font`, variável `--font-space-grotesk`), títulos h1 a h3 em 700 com -0.02em e `text-wrap: balance`, texto em 400 e 500.
**Números e rótulos:** IBM Plex Mono 400 a 600 (`--font-ibm-plex-mono`) com `tabular-nums`: contagens (faixa, Quadro, Por projeto), "Passo N de M", datas e metadados de atividade, "Mostrando N de M", cabeçalhos de tabela (0,75rem, peso 500, 0,1em, maiúsculas), selos de estado (0,75rem) e teclas (`kbd`). Mono só em dado e medida, nunca como fantasia "técnica".

A escala de tamanhos das telas continua a mesma (16px de corpo); a escala do design system é de peças de marketing.

### Hierarchy

- **Display** (700, 1.75 a 2.5rem, 1.15): título da página.
- **Headline** (700, 1.25rem, 1.5): títulos de seção (Agora, Em andamento) e título da janela.
- **Body** (400, 1rem, 1.5): conteúdo; medida máxima de 65ch em textos corridos.
- **Step** (600, 1.75rem, 1.2, Space Grotesk): o passo atual, no bloco Agora e na janela da demanda.
- **Count** (600, 1.375rem, Plex Mono): as contagens da faixa, do Quadro e do Por projeto.
- **Title** (600, 1.125rem, 1.5): nome da marca na barra superior e título da demanda no bloco Agora.
- **Small** (400, 0.875rem, 1.5): projeto, atividade, contagem de passos e metadados.
- **Label** (500, 0.75rem, Plex Mono, maiúsculas): cabeçalhos de coluna; rótulos de campo seguem em Space Grotesk 600 a 0.8125rem.

## Layout

Casca em duas colunas no computador e no iPad: barra lateral fixa de 15rem e área de trabalho com máximo de 72rem. Abaixo de 48rem a lateral vira menu sob a barra superior. No modo Foco (a partir de 48rem) a lateral some e o conteúdo centra com máximo de 48rem. Espaçamento em múltiplos de 8px; mais espaço acima do título do que abaixo. A página nunca rola na horizontal: tabelas largas rolam dentro da própria região.

## Elevation & Depth

Sem sombras e sem gradientes (design system Moraes Coding). A profundidade vem da troca de superfície (Gelo, Névoa, branco; no escuro Mata e Noite) e de filetes. O que flutua (avisos de confirmação, botão flutuante de captura) se separa por borda e superfície, não por sombra. A janela da demanda se separa da página pelo véu `--mcv-scrim`, metade Mata e metade Alta a 45% no claro e Noite a 70% no escuro, com `backdrop-filter: blur(4px)`, que cumpre função (isola o foco modal), não enfeite.

### Named Rules

**The Flat Rule.** Nenhuma `box-shadow` e nenhum gradiente (verificado em `contrast.test.ts`). O único desfoque é o do fundo da janela modal.

## Shapes

Raios do design system: 4px (`raio-4`) no anel de foco e nas teclas, 6px (`raio-6`) em botões, campos e itens de navegação, 12px (`raio-12`) em cartões, janelas e no botão flutuante de captura, 999px em selos e nos segmentos de progresso. Bordas de 1px (`traco-fino`) em divisores, contêineres e selos; 1,5px (`traco-controle`) em botões fantasma, botões de ícone e na faixa de contagens. No celular a janela ocupa a tela inteira, sem borda nem raio.

## Components

### Navigation

**Logo:** o ícone do componente Logo da Moraes Coding (`BrandIcon`: cinco barras e a linha de base em `texto-titulo`, a barra de hoje em `destaque`; no chrome, Névoa e Sinal), 32px, com o nome da empresa do usuário ao lado, lido do banco (`organizations.name` pela `getCurrentUser`, sob a RLS; decisões 3 e 5 da tarefa de marca): Space Grotesk 600, `texto-titulo`, por extenso ("Moraes Coding", nunca o wordmark "moraes.coding"), com reticências se não couber. O nome do produto, "Trilha JP3", fica no título da aba, no app instalado e na tela de entrada. **Topo e barra lateral em Mata** ("terminal de BI" do design system; proposta 2 do impeccable, aprovada pelo Pedro em 2026-10-27): no claro, fundo Mata com texto Névoa, filetes #24412F, bordas de controle #9DB5A8 e foco Sinal #FF5A1F; no escuro, fundo Noite. Os tokens `--mcv-chrome-*` trocam os `--mcv-*` só dentro da barra lateral e dos itens do topo; a janela de captura e o aviso, que moram no topo, ficam com as cores da página. Itens de 44px de altura; o atual vai sobre `--mcv-chrome-current` (Noite no claro, Mata no escuro), em peso 600, com `aria-current="page"`, sem sombra. Itens: Retomar, Demandas e Projetos; logo abaixo, o botão Sair no mesmo estilo. No celular, botão de menu com `aria-expanded`.

### Icon buttons (tema, Foco/Completo, menu, fechar)

44px, botão fantasma: fundo transparente, borda de 1,5px `borda-controle`, borda `texto` ao passar o mouse. Ícones do design system (componente `Icon`, `src/components/icon.tsx`): grade de 24px, traço de 2px, pontas retas, cantos vivos, cor do texto, 20px (18px no botão de captura, 14px na seta de ordenação). Menu, fechar, adicionar, setas e `painel` (grade do modo Completo) vêm do manual; sol, lua e alvo não existem nele e foram desenhados no mesmo traço. **Tema e Foco (fatia 2, opção C, aprovada pelo Pedro em 2026-10-28):** a partir de 60rem o botão mostra o ícone e o nome da ação ("Escuro"/"Claro", "Foco"/"Completo"), com largura própria; no celular, só o ícone. O nome à vista está contido no nome acessível ("Ativar modo escuro"), como pede o WCAG 2.5.3.

### Buttons

- **Primário, variante `alta`** ("Concluir passo", "Nova demanda", "Novo projeto", "Entrar"): fundo Alta #14704A, texto Gelo (5,4:1), raio 6px, 44px de altura mínima, peso 600; ao passar o mouse fica Mata. Igual nos dois temas.
- **Secundário, variante `fantasma`** ("Marcar como Agora", "Editar", "Copiar link"): fundo transparente, borda de 1,5px `borda-controle`, 44px; borda `texto` ao passar o mouse. Com `aria-pressed="true"` fica em `texto-titulo`, peso 600. Oculto no modo Foco.
- A variante `sinal` do design system não entra no app (é a chamada das peças de marketing).

### Badges de estado

Pílula com borda `borda`, Plex Mono 0,75rem com 0,04em. "Fazendo" ganha borda Alta e texto `texto-titulo` em peso 600; "Feito" fica em `texto-apoio`. O texto sempre diz o estado.

### Filete de progresso (StepProgress)

Um traço de 3px por passo, em pílula, com 4px entre eles e largura máxima de 12rem. Vazio em `borda`, concluído em `texto-titulo`. É `aria-hidden`: o texto "Passo N de M" ao lado, em Plex Mono e destaque, diz o mesmo.

### Retomar: Agora, Em andamento e Feito hoje

Três blocos, nessa ordem, separados por filetes. **Agora**: título da seção em Space Grotesk, a demanda (botão com aparência de link), o projeto em texto suave, o passo atual em Space Grotesk 1,75rem, "Passo N de M" (Plex Mono, destaque), o filete de progresso e o botão "Concluir passo". **Em andamento (N)**: as demais demandas em Fazendo, da atividade mais recente à mais antiga, sem repetir a Agora. **Feito hoje (N)**: grupo recolhido com o que foi concluído no dia; o marcador do `summary` é `texto-titulo`. Sem demanda marcada, a Agora é uma sugestão (a mais recente) e diz isso em texto. No Foco, só o bloco Agora aparece.

### Faixa de contagens (página Demandas)

Três botões em linha: número grande (Plex Mono 600, 1,375rem; o de Fazendo em destaque) e o estado por extenso, por exemplo "3 Fazendo". Mostram quantas demandas há em cada estado, respeitando os filtros de Projeto e Prioridade. Clicar filtra a tabela por aquele estado (`aria-pressed`); clicar de novo limpa. Selecionado: borda `texto` e fundo Névoa, peso 600, nunca verde nem sombra. Alvo de 44px.

### Cartão de projeto (visão Por projeto)

Um cartão por projeto, em grade automática pela largura do contêiner (cartões de no mínimo 15rem: 3 colunas no computador, 2 no iPad e no Foco, 1 no celular). Superfície branca, filete de 1px, raio 12px, sem sombra. Cabeçalho: nome (Space Grotesk 600, 1,125rem), contagens na ordem da faixa e do Quadro, "1 A fazer · 2 Fazendo · 1 Feito", com o número em Plex Mono 1,375rem, e o filete segmentado com "1 de 4 demandas feitas". Mostra as 2 primeiras demandas (título, estado, prioridade, próxima subtarefa; sem texto de enchimento quando não há subtarefa) e "Ver mais N" expande o cartão (`aria-expanded`, nome acessível "Ver mais N demandas de {projeto}"). No modo Foco mostra 5 projetos e diz quantos ficam escondidos. Sem verde: o estado Fazendo usa a mesma insígnia da Tabela. A escolha da visão fica salva, como o filtro.

### Quadro (visão por estado)

Três colunas, A fazer, Fazendo e Feito, a partir de 60rem (o mesmo ponto em que a Tabela vira cartões) e empilhadas abaixo, inclusive no iPad em pé. Cabeçalho da coluna: número em 1,375rem e o estado por extenso, com filete embaixo. Cartão branco com filete de 1px: título (abre a janela), projeto e prioridade, e o menu "Mover para…". Mover é um `select` nativo com só os outros dois estados, alvo de 44px: funciona por teclado, toque e leitor de tela, sem depender de arrastar (alternativa ao arrastar, WCAG 2.5.7). O movimento é anunciado numa região `role="status"` ("Fotos da equipe movida para Feito.") que também aparece como texto à vista, colada ao fim da tela, por 4 segundos. O foco volta ao menu do cartão na coluna nova. Coluna vazia diz "Nenhuma demanda em {estado}." A faixa de contagens some nesta visão, porque as colunas já são os estados. No modo Foco cada coluna mostra 5 cartões e diz quantos ficam escondidos. Sem verde nos cartões.

### Captura rápida (T6d)

Botão fantasma na barra do topo a partir de 60rem (proposta 1 do impeccable: um só botão cheio por tela, o da ação da página), com o texto "Nova demanda" e a tecla `C` como dica; no celular vira um botão flutuante de 56px no canto de baixo à direita, com o texto só para leitor de tela, e o conteúdo ganha folga embaixo para nunca ser coberto. A janela reaproveita a janela da demanda (fundo fosco, foco preso e devolvido): título "Nova demanda", um campo de texto (Enter cria, Esc cancela), Projeto (lembra o último usado) e Prioridade (Média). Título vazio diz "Escreva o título da demanda." num `role="alert"`. Título parecido com outra demanda mostra "Parecida com:" e a lista, e o botão vira "Criar mesmo assim". Desde a T5 a janela grava no banco: ao abrir, busca os projetos reais e os títulos para o aviso de parecida ("Carregando…" enquanto isso; sem projeto, um link para Projetos). Criada, a demanda nasce em A fazer, a janela fecha e uma confirmação "Demanda criada: …" fica à vista por 4 segundos; se não gravar, a janela fica aberta com o título e o erro. O atalho `C` não vale digitando, com modificador nem com outra janela aberta. A tecla da dica (`kbd`) usa raio de 4px e Plex Mono em 0,75rem: a escala "key" e o raio "xs", só para teclas.

### Controles, véu e movimento

Bordas de controles (selects, faixa de contagens, botões de ícone e secundário) usam `--mcv-control-line` (`borda-controle`, 5,6:1 no Gelo e 6,6:1 sobre Mata, WCAG 1.4.11); a `borda`, decorativa, fica para divisores e bordas de contêineres e selos, que não dependem dela para serem reconhecidos. O véu da janela é o token `--mcv-scrim` (Elevation & Depth). Sem sombras. Movimento: a janela entra em 180ms (esmaece e sobe 8px); com movimento reduzido só esmaece, em 120ms, e o estado continua legível. O estado pressionado da faixa de contagens usa borda `texto` e peso 600, nunca verde.

### Interruptor Foco/Completo

Botão de ícone (44px) no cabeçalho, ao lado do tema, com `aria-pressed`. No Completo mostra o alvo (ativar foco); no Foco mostra a grade (ativar completo). Dica "Alternar Foco e Completo (F)", atalho `F` (ignorado ao digitar ou com Ctrl, Cmd e Alt) e aviso a leitores de tela. O modo vive em `data-mode` no `<html>`. Foco: barra lateral escondida, marca no cabeçalho, conteúdo centrado (máx. 48rem), só o bloco Agora em Retomar e, na janela, só o passo atual, Subtarefas e nenhum botão secundário.

### Janela da demanda

Janela centrada (máx. 40rem) sobre a página, fundo `fundo`, borda `borda`, raio 12px. O fundo da página atrás vira o véu `--mcv-scrim` com `backdrop-filter: blur(4px)`. No celular ocupa a tela inteira. Topo: título em Space Grotesk, botão Fechar, estado e, ao lado, o botão "Marcar como Agora" ou "Tirar de Agora" (oculto no Foco). Depois o **passo atual** (Step) entre filetes, com o filete de progresso e o botão "Concluir passo", que recebe o foco inicial. Abaixo, grupos recolhíveis (Subtarefas aberto; Comentários, Anexos e Histórico fechados), cada um com contagem e marcador `texto-titulo`. Fecha com `Esc`, botão ou clique fora; o foco fica preso na janela e volta ao ponto de origem. **Endereço (T5b):** abrir a janela troca o endereço para `/demandas/{id}`; fechar, `Esc` ou Voltar do navegador volta ao endereço anterior, e Avançar reabre. No topo, entre o título e Fechar, o link "Abrir em página inteira" (0,875rem, sublinhado Alta, alvo de 44px; no celular desce para baixo do título). A página substitui a janela no histórico. Na lista de Subtarefas o passo atual diz "agora" em texto.

**Vazio sem gritar** (proposta 4 do impeccable): grupo sem item não aparece como "(0)". Os vazios viram uma linha só em `texto-apoio`, depois dos grupos ("Sem anexos nem histórico"); sem subtarefas, a linha toma o lugar do passo atual ("Sem subtarefas, comentários, anexos nem histórico"). "Sem passos pendentes" e o vazio do bloco Agora também são texto de apoio, nunca do tamanho do passo.

### Demanda em página inteira (T5b)

Rota `/demandas/{id}`, link permanente, para sessões longas (proposta A, escolhida pelo Pedro em 2026-10-25). Topo: caminho "Demandas / {projeto}" (o primeiro é link), título em Display, linha de metadados em `text-soft` 0,875rem (estado, projeto · prioridade · última atividade) com "Marcar como Agora" ou "Tirar de Agora" e "Copiar link" à direita, e um filete. "Copiar link" confirma "Link copiado." na mesma faixa de aviso do Quadro (4 segundos); sem área de transferência, diz que o endereço está na barra do navegador. Corpo em três colunas separadas por filetes verticais de 1px, sem cartões nem sombra: Subtarefas (18rem, numeradas, filete entre os itens, o passo atual em `texto-titulo`, peso 600 e "agora" por extenso) | Agora (título de seção, o passo em Step 1,75rem, "Passo N de M", filete de progresso, "Concluir passo") e Comentários | Anexos e Histórico (18rem). Tudo aberto, com títulos h2 de 1,25rem, nunca grupos recolhíveis. As colunas seguem a largura da área de conteúdo (container query): 3 com 60rem ou mais, 2 com 32rem ou mais (Anexos e Histórico descem lado a lado), 1 abaixo disso, onde os botões ocupam a própria linha. No Foco ficam só Subtarefas e Agora; some "Marcar como Agora", "Copiar link" fica. Id desconhecido: "Demanda não encontrada." com link para Demandas.

### Editar a demanda e importar do navegador (T5.3)

Propostas A e C, aprovadas pelo Pedro em 2026-10-27 (telas reais em HTML). **Editar:** botão secundário "Editar" na linha de metadados da página inteira, entre "Marcar como Agora" e "Copiar link". Abre o próprio cabeçalho (título e metadados) como formulário, no padrão de Projetos: superfície com borda `borda` e raio 12px; Título (1,25rem, peso 600) e Descrição na largura toda; Prioridade e Prazo (`input type="date"`) lado a lado; "Cancelar" e "Salvar" à direita. Erro por campo como em Projetos, com o foco no primeiro campo inválido; ao fechar, o foco volta a "Editar" e "Demanda salva." aparece na faixa de aviso. Fora da edição, o prazo entra nos metadados ("Prazo 30 de out.", com o ano só se for outro) e a descrição fica logo abaixo do filete, em medida de 65ch, respeitando as quebras de linha. **Importar:** enquanto houver demandas capturadas só no navegador (antes da T5), Demandas mostra no topo um aviso em Névoa com borda de controle: a frase "N demandas capturadas só neste navegador." em peso 600, a lista com caixas de marcar (todas marcadas, alvo de 44px, filete entre elas), o campo Projeto e "Importar N demandas" (primário); "Descartar as desmarcadas" (secundário) aparece quando alguma está desmarcada. Importadas, somem do navegador, e o aviso "N demandas importadas para {projeto}." fica na faixa de aviso. Sem projeto, aponta para Projetos.

### App instalado (T12)

O app se instala na tela inicial do iPad (Safari) e no computador (Chrome ou Edge) e abre em tela cheia (`display: standalone`), sem modo offline. Ícone (fatia 2 da marca): o M de cinco barras da Moraes Coding em Névoa, com a barra de hoje em Sinal, sobre Mata, a partir de `docs/brand/moraes-coding/mc-icone-cor-fundo-escuro.svg` (o arquivo oficial sem o bloco de metadados). `public/icon.svg`, os PNG de 192 e 512 e o `apple-icon` de 180 levam o desenho a 87% (cerca de 72% da largura); o `maskable` de 512 a 70% (58%, dentro dos 80% centrais); o `favicon.ico` tem PNG RGBA de 16, 32 e 48. O fundo de abertura é Gelo `#F2F2EE` e a cor do tema é Mata `#0C2A1E`. A barra do navegador acompanha o topo do app: Mata no claro, Noite `#08180F` no escuro. A barra de status do iPad fica no padrão, e o conteúdo nunca passa por baixo dela.

### Tela de entrada (T3)

Rota `/entrar`, fora da casca (proposta B, mesa dividida, escolhida pelo Pedro em 2026-10-26). Faixa à esquerda (2fr, mínimo 18rem, padding 2,5rem) com o ícone e o nome do produto ("Trilha JP3") no topo e a frase "Projetos e demandas da Moraes Coding." embaixo, em Display 600, de 1,375 a 1,75rem conforme a largura; à direita, no Papel, o título "Entrar" (1,25rem) e o formulário até 22rem: rótulos de 0,8125rem peso 600, campos de 44px com borda de controle, botão primário de largura total. A faixa usa os tokens do chrome do topo: Mata no claro e Noite no escuro, texto e logo em Névoa, a barra de hoje do logo em Sinal, filete à direita. Abaixo de 45rem a faixa vira uma barra com ícone e nome e a frase some. O aviso de erro é o mesmo da captura: `texto` peso 600 sobre Névoa com borda de controle, nunca vermelho; vazio, fica no DOM (região viva) sem ocupar espaço. Pendente: "Entrando…" com o botão em `text-soft`. O botão Sair fica na barra lateral do app, logo abaixo da navegação, no estilo dos itens dela.

### Projetos (T4)

Rota `/projetos` (proposta A, grupos por estado, escolhida pelo Pedro em 2026-10-27). Cabeçalho da página com "Novo projeto" (botão primário). Abas "Ativos (N)" e "Arquivados (N)" no mesmo sublinhado das visões de Demandas (proposta 6 do impeccable): a atual em `texto`, peso 600 e traço de 2px. Abas e grupos vão até 56rem. Grupos por estado com título h2 de 1,125rem e a contagem em `text-soft`, filete embaixo; linhas em grade (nome peso 600, "Prioridade Média" com o rótulo à vista e link em 0,875rem; link em `texto-titulo` com sublinhado, só o endereço sem `https://`; "Editar" em botão secundário), filete de 1px entre elas. Editar abre o formulário no lugar da linha: superfície com borda `borda` e raio 12px, grade de 3 colunas (nome 2fr, estado e prioridade), descrição e link na largura toda; erro por campo em `texto` peso 600, campo inválido com borda `texto` de 2px. "Arquivar" à esquerda, "Cancelar" e "Salvar" à direita. No celular, cada linha empilha nome, prioridade e link com "Editar" à direita, e o formulário vira uma coluna. A casca reserva 6rem no fim da página no celular para o botão flutuante de captura não cobrir o último item.

### Tabelas

Filetes de 1px, cabeçalho em Plex Mono 0,75rem maiúsculo em `text-soft`, primeira coluna como cabeçalho de linha, números tabulares. Os títulos que abrem a demanda (`.resume-open`) têm alvo de toque de 44px (10px de folga em cima e embaixo, devolvidos ao layout por margem negativa). Selects em 16px, para o iPhone não dar zoom ao tocar.

## Do's and Don'ts

### Do:

- **Do** usar os tokens `--mcv-*` em vez de valores soltos.
- **Do** escrever estado e prioridade por extenso, com cor só como reforço.
- **Do** manter o foco do design system (3px em destaque, deslocado 3px, raio 4) e alvos de 44px.
- **Do** usar `--mcv-text-soft` para texto secundário pequeno.
- **Do** repetir em texto o que o filete de progresso mostra.
- **Do** pôr números, datas e contagens em IBM Plex Mono com `tabular-nums`.

### Don't:

- **Don't** usar cinza puro ou preto puro; os neutros vêm do design system.
- **Don't** repetir cartões iguais como estrutura de página. Exceções: a lista de demandas abaixo de 60rem, onde cada demanda vira um cartão para nunca haver rolagem horizontal, e as visões Por projeto (um cartão por projeto) e Quadro (cartões de demanda em colunas), escolhidas pelo Pedro em 2026-10-23.
- **Don't** usar sombra, gradiente ou desfoque como enfeite.
- **Don't** usar o laranja mais de uma vez por tela, nem como cor de ícone.
- **Don't** usar Sinal claro ou Mostarda como texto sobre Gelo.
- **Don't** usar mono em texto corrido ou em nomes (projeto, prioridade, título).
