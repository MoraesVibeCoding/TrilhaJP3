# TM: Marca Moraes Coding no app

Status: **aprovada pelo Pedro em 2026-10-27** (decisões 1 a 5 e o nome do produto). Em construção. Decisão de origem: o Pedro definiu em 2026-10-27 que a empresa passa a ser Moraes Coding (direção visual B · Gráfico) e que o app troca de marca **depois da T5**. Base: pacote `moraes-coding-marca.zip` (manual de marca, `04-logo/svg/`), `DESIGN.md`, `PRODUCT.md`, `CONSTRAINTS.md`, regra de design do `CLAUDE.md` (toda decisão do `impeccable` vem com HTML para aprovação).

## 1. Objetivo

O TrilhaJp3 passa a usar a marca Moraes Coding: cores, tipografia, ícone, PWA, nome da empresa nas telas e no banco. O nome do app (TrilhaJp3), o layout aprovado das telas e o comportamento não mudam. A troca é de pele e de nome, não de produto.

## 2. Fatos de partida

1. **Cores:** 40 variáveis `--mcv-*` em `src/styles/tokens.css` (claro e escuro); `globals.css` usa as variáveis em 211 lugares e tem 6 valores soltos (véu, sombra, dois neutros).
2. **Tipografia:** Geist via `next/font/google` em `src/app/layout.tsx`; `--mcv-font-display` e `--mcv-font-body` em `tokens.css`.
3. **Ícone:** componente `brand-icon.tsx` (M em circuito com nó de pulso), `public/icon.svg`, `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `src/app/apple-icon.png`, `src/app/favicon.ico`; `manifest.ts` com `theme_color` #1B4D2E e `background_color` #F8FAF5.
4. **Nome da empresa:** "Moraes CodeVibe" em `app-shell.tsx:98` (rodapé da barra lateral), `entrar/page.tsx:16` (frase da tela de entrada), `manifest.ts:8` e `layout.tsx:14` (descrição), cabeçalho de `tokens.css`; e no banco, na linha da empresa criada pela migração `20261026190000_moraes_codevibe.sql` (já aplicada).
5. **Documentos:** `PRODUCT.md`, `DESIGN.md` e 6 superfícies em `.impeccable/surfaces/` descrevem a marca V2.
6. **Marca nova (manual):** Mata #0C2A1E (principal), Noite #08180F, Alta #14704A (links, botões, positivo), Sinal #FF5A1F (só sobre escuro) e Sinal escuro #B83300 (sobre claro), Mostarda #E3B23C (atenção, só preenchimento), Tijolo #9A3B2E (risco), Névoa #E6ECE7 (superfícies), Gelo #F2F2EE (fundo). Contraste medido no manual. Space Grotesk (títulos 600/700, texto e telas 400/500) e IBM Plex Mono (números, valores, rótulos). Laranja "uma vez por peça", no número que importa. Cor nunca sozinha.

## 3. Requisitos funcionais

Fonte de verdade: o **design system Moraes Coding** (artifact `CeaPqHJ1X5V61mPWYFZnTN`: `README.md`, `tokens.json`, `voz.md`, componentes Botao, Logo, Icone, Sinal), que vem do mesmo pacote da marca e o detalha para telas. Onde ele e esta spec divergirem, vale ele.

1. **Cores pelos tokens semânticos do design system,** com os dois temas que ele já define (Claro = Gelo, Escuro = Mata):

   | Papel no app (token atual)           | Token do design system                    | Claro                        | Escuro        |
   | ------------------------------------ | ----------------------------------------- | ---------------------------- | ------------- |
   | Fundo da página (`paper`)            | `fundo`                                   | Gelo #F2F2EE                 | Mata #0C2A1E  |
   | Cartões, janelas (`card`)            | `superficie`                              | branco                       | Noite #08180F |
   | Barra lateral, notas (`mint`)        | `superficie-suave`                        | Névoa #E6ECE7                | Noite         |
   | Texto (`ink`)                        | `texto`                                   | Noite                        | Névoa         |
   | Títulos h1 a h3 (`forest`)           | `texto-titulo`                            | Mata                         | Névoa         |
   | Texto secundário (`text-soft`)       | `texto-apoio`                             | #5C625E                      | #B9CCC1       |
   | Rótulos e perguntas acima de números | `texto-rotulo`                            | Alta #14704A                 | #9DB5A8       |
   | Divisórias (`line`)                  | `borda` (decorativa)                      | #D6DED8                      | #24412F       |
   | Borda de controles (`control-line`)  | `borda-controle`                          | #5C625E                      | #9DB5A8       |
   | Botão primário (`forest`)            | botão `alta`                              | Alta, texto Gelo; hover Mata | idem          |
   | Número que importa, uma vez por tela | `destaque`                                | Sinal escuro #B83300         | Sinal #FF5A1F |
   | Foco                                 | `foco`, anel de 3px deslocado 3px, raio 4 | Sinal escuro                 | Sinal         |
   | Positivo, atenção, risco             | `positivo`, `atencao`, `risco`            | Alta, Mostarda, Tijolo       | idem          |

   Proibidos como texto: Sinal e Mostarda sobre Gelo. Cor nunca sozinha. Sem azul nem roxo. A troca fica nos tokens; os nomes `--mcv-*` usados no CSS passam a apontar para os do design system.

2. **Forma:** raios do design system (botões `raio-6`, campos e itens `raio-6`, cartões e janelas `raio-12`, selos e emblemas `raio-pilula`); bordas de 1px (`traco-fino`), botão secundário com 1,5px (`traco-controle`). **Sem sombras e sem gradientes**: o token `--mcv-shadow` sai (hoje no item atual da navegação, nos avisos flutuantes e no botão flutuante do celular); a profundidade vem da troca de superfície.
3. **Tipografia:** Space Grotesk 600–700 em títulos (espaçamento -0,01 a -0,025em, `text-wrap: balance`) e 400–500 no texto; **IBM Plex Mono em números, valores, rótulos e código**, com `tabular-nums` em tabelas e contagens; sem itálico. A escala de tamanhos do app (16px de corpo) continua; o design system define a escala de peças de marketing, não de telas.
4. **Botões:** primário = variante `alta`; secundário = variante `fantasma` (fundo transparente, borda `borda-controle` de 1,5px, hover com borda `texto`); a variante `sinal` não entra no app (é a chamada "Agendar diagnóstico" das peças de marketing).
5. **Ícones de interface:** os 36 ícones do componente Icone do design system (grade de 24px, traço de 2px, pontas retas, sem preenchimento), que o próprio design system diz serem para o Trilha JP3, substituem os SVG desenhados à mão no app (menu, tema, foco, fechar, adicionar). Cor = cor do texto ao lado, nunca `destaque`. Botão só com ícone: alvo mínimo 40px pelo design system; o app mantém 44px (WCAG e `DESIGN.md`).
6. **Logo, ícone e PWA:** componente Logo do design system (barras e wordmark em `texto-titulo`, barra de hoje em `destaque`, trocam sozinhos com o tema) no app; SVGs do grupo Logos para favicon, ícones do PWA e `apple-icon` (`mc-icone-*`, `mc-app-icone`). Mínimo: ícone 24px, horizontal 120px; respiro de duas barras; nunca distorcer, girar, reordenar as barras, nem aplicar sombra ou gradiente. `theme_color` e `background_color` da paleta nova.
7. **Nome:** o topo do app mostra o ícone de barras e o nome da empresa do usuário, lido do banco (decisões 3 e 5); "Moraes Coding" nas descrições fixas; a migração nova renomeia a empresa, com reversão.
8. **Documentos:** `PRODUCT.md` e `DESIGN.md` reescritos a partir do design system; as superfícies do `impeccable` atualizadas; o kit V2 fica em `docs/brand/` como histórico.

## 4. Requisitos não funcionais

1. **Contraste WCAG 2.1 AA** medido nos dois temas, para cada par usado (texto, controles 3:1, foco). O teste de acessibilidade (`e2e/accessibility.spec.ts`, 22 varreduras) continua verde.
2. **Sem regressão de comportamento:** unitários, E2E e banco sem mudança de asserção além das que citam cor ou fonte, se houver.
3. **Repositório público:** nada do manual, dos documentos de estratégia nem do nome completo do Pedro entra no repositório.

## 5. Fatias

1. Tokens, claro e escuro, e fontes (com 3 propostas de aplicação e HTML para aprovação).
2. Ícone, favicon e PWA.
3. Nome nas telas e migração do banco.
4. Documentos, `impeccable` (critique e auditoria), revisão de segurança, `check:full`, PR.

## 6. Testes e critérios de aceitação

1. Varredura de contraste dos pares da paleta nos dois temas (script ou teste, valores no `DESIGN.md`).
2. `npm run test:db`: a empresa existe com o nome novo e exatamente um dono (`company.test.ts` atualizado).
3. E2E de acessibilidade verde; E2E do PWA verde com os ícones novos no tamanho declarado.
4. O Pedro aprova o visual pelo HTML das telas reais (Retomar, Demandas, página da demanda, Projetos, entrada), claro e escuro.

## 7. Fora do escopo

Landing page, kit de lançamento, domínio `moraescoding.com.br`, registro no INPI, telas novas, mudança de layout ou de comportamento.

## 8. Riscos

1. **Laranja sobre claro** falha como texto (2,8:1): usar Sinal escuro #B83300 no claro, como o manual manda.
2. **Tema escuro** vem pronto do design system (Mata e Noite como fundos); só precisa ser medido nas telas do app.
3. **Fonte nova muda medidas:** a Space Grotesk é mais larga que a Geist; textos podem quebrar em outra largura (E2E de "sem rolagem horizontal" pega).
4. **Ícone do PWA no iPad** pode ficar em cache; reinstalar o app para conferir.

## 9. Decisões (uma de cada vez)

**Regra geral, do Pedro em 2026-10-27: na dúvida de marca, seguir sempre o manual da Moraes Coding.** Entra no `CLAUDE.md` junto com esta tarefa. Só sobe para decisão o que o manual não cobre.

1. **Papel do laranja (Sinal) no app. Decidido pelo Pedro em 2026-10-27: seguir o manual.** Laranja uma vez por tela, no número que importa (por exemplo, o passo atual ou a contagem de Fazendo); Sinal escuro #B83300 sobre fundo claro, Sinal #FF5A1F sobre escuro. O Pulso lime sai do app; o estado "Claude trabalhando", quando existir, usa a mesma cor. Alternativa descartada: manter o Pulso só para "Claude trabalhando".
2. **Fonte de números (IBM Plex Mono). Decidido pelo Pedro em 2026-10-27: manual, ajustado ao design system.** IBM Plex Mono em números, valores, rótulos e código (contagens, datas, "Passo N de M", rótulos de seção e cabeçalhos de tabela), com `tabular-nums`; Space Grotesk no resto.
3. **Cabeçalho do app. Decidido pelo Pedro em 2026-10-27: a marca do cliente ("Moraes Coding"), não a do produto.** Motivo: o TrilhaJp3 vai ser comercializado; cada empresa cliente vê a própria marca no topo. Nesta tarefa o nome no topo vem do banco (`organizations.name` da empresa do usuário; `getCurrentUser()` hoje lê só o id da empresa e passa a trazer o nome também, sob a mesma RLS), não do código; o ícone é o da Moraes Coding como padrão. "TrilhaJp3" fica como nome do produto (título da aba, PWA, tela de entrada).
4. **Marca configurável por cliente (logo e cores próprios). Decidido pelo Pedro em 2026-10-27: depois.** Nesta tarefa só o nome da empresa vem do banco; ícone e cores da Moraes Coding ficam fixos como padrão. Logo e cores por cliente viram tarefa futura, junto com o cadastro de empresas (fora da v1), depois do Storage da T11. O código desta tarefa não fecha esse caminho: cores continuam em tokens `--mcv-*` (trocáveis por empresa) e o nome já vem do banco.

### Conferência com os artefatos (2026-10-27)

1. Canvas de identidade `EcsiV1WM…` = pranchas finais do zip (9 de 9 arquivos idênticos).
2. Design system `CeaPqHJ1X5V61mPWYFZnTN`: lido `README.md`, `tokens.json`, `voz.md` e os componentes Botao, Logo, Icone, Sinal, Kpi, Selo, Painel. A seção 3 foi reescrita a partir dele: tokens semânticos com tema escuro, foco de 3px em `destaque`, raios, sem sombra, botões `alta` e `fantasma`, ícones de interface, Plex Mono também em rótulos, componente Logo.
3. Decisões já tomadas que o design system confirma: 1 (laranja uma vez, em `destaque`), 2 (Plex Mono, agora também em rótulos), 4 (marca por cliente depois). A decisão 5 tem resposta no design system (componente Logo), mas a escolha continua do Pedro.

### Perguntas abertas que o design system levanta

- **Nome do produto. Decidido pelo Pedro em 2026-10-27: "Trilha JP3"** (com espaço e JP3 em maiúsculas, como o design system). Troca em tudo que aparece ao usuário: título da aba (`layout.tsx`), `manifest.ts` (`name`, `short_name`), nome na tela de entrada e na casca, textos e documentos. Nome do repositório, do pacote npm e identificadores de código não mudam.
- **Componentes de dados** (Kpi, GraficoBarras, Selo "Aferido", Painel): são da linguagem de BI da marca; o app de demandas não tem painéis hoje. Ficam fora desta tarefa.

5. **Topo do app. Decidido pelo Pedro em 2026-10-27: ícone + nome da empresa (B).** O ícone de barras do design system (componente Logo, variante `icone`, cores do tema) e, ao lado, o nome da empresa do usuário por extenso, lido do banco (`organizations.name`: "Moraes Coding"), em Space Grotesk 600 e cor `texto-titulo`. **Exceção registrada ao manual**, escolhida pelo Pedro porque o nome tem de ser configurável por cliente: o topo não usa o wordmark "moraes.coding". Para não parecer um logo recriado, o nome segue a regra de texto corrido ("Moraes Coding", nunca "moraes.coding" nem minúsculas) e o espaçamento entre ícone e nome segue o respiro mínimo do logo (duas barras). Alternativa descartada: logo oficial + "Trilha JP3" (A).

## 10. Tarefas depois da aprovação

1. Branch nova a partir de `main` (com a T5); spec em `tasks/tm-spec.md`.
2. Tokens e fontes; 3 propostas do `impeccable` com HTML; escolha do Pedro.
3. Ícone e PWA; nome nas telas; migração de renomear com reversão e teste.
4. Documentos; critique e auditoria; revisão de segurança; `check:full`; `docs/STATUS.md`; PR.
