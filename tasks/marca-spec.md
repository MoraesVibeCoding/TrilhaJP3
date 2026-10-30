# TM: troca de marca para Moraes Coding

Status: **aprovada pelo Pedro em 2026-10-28 ("De acordo"); proposta A escolhida em 2026-10-28; migração do nome aprovada ("sim"); construída em 2026-10-29.** Decidida em 2026-10-27 para depois da T5, que foi mesclada (PR #5).

Fonte da marca: design system "Moraes Coding" no claude.ai (`https://claude.ai/artifact/CeaPqHJ1X5V61mPWYFZnTN`), versão de 2026-10-27, que traz `tokens.json`, os SVGs dos logos e dos 36 ícones de interface, os componentes e o pacote `moraes-coding-marca.zip`.

## 1. Objetivo

O app deixa de mostrar a marca V2 da Moraes CodeVibe e passa a mostrar a marca Moraes Coding, direção B · Gráfico: Gelo como fundo, Mata como cor principal, um único Sinal laranja por tela, Space Grotesk e IBM Plex Mono, e o M de cinco barras como ícone. O comportamento do app não muda: nenhuma tela, rota, ação ou dado muda de função.

## 2. Requisitos funcionais

1. **Tokens.** `src/styles/tokens.css` recebe as cores, os raios e as espessuras de `tokens.json`, nos temas Claro (Gelo) e Escuro (Mata), seguindo a preferência do sistema e o atributo `data-theme`, como hoje.
2. **Nomes das variáveis.** Os nomes `--mcv-*` continuam os mesmos e só os valores mudam, para não reescrever as 212 referências de `globals.css` nesta tarefa. A tabela de correspondência fica no topo de `tokens.css`:

   | Variável atual                    | Claro                                | Escuro                   |
   | --------------------------------- | ------------------------------------ | ------------------------ |
   | `--mcv-paper` (fundo)             | Gelo `#F2F2EE`                       | Mata `#0C2A1E`           |
   | `--mcv-card` (superfície)         | branco `#FFFFFF`                     | Noite `#08180F`          |
   | `--mcv-mint` (superfície suave)   | Névoa `#E6ECE7`                      | Noite `#08180F`          |
   | `--mcv-ink` (texto)               | Noite `#08180F`                      | Névoa `#E6ECE7`          |
   | `--mcv-forest` (títulos, marca)   | Mata `#0C2A1E`                       | Névoa `#E6ECE7`          |
   | `--mcv-leaf` (links, ação)        | Alta `#14704A`                       | apoio escuro `#9DB5A8`   |
   | `--mcv-text-soft` (apoio)         | apoio `#5C625E`                      | apoio escuro 2 `#B9CCC1` |
   | `--mcv-stone` (borda de controle) | apoio `#5C625E`                      | apoio escuro `#9DB5A8`   |
   | `--mcv-line` (borda fina)         | linha `#D6DED8`                      | linha escura `#24412F`   |
   | `--mcv-pulse` (o sinal)           | Sinal escuro `#B83300`               | Sinal `#FF5A1F`          |
   | `--mcv-gold` (atenção)            | Mostarda `#E3B23C`, só preenchimento | Mostarda `#E3B23C`       |
   | `--mcv-focus` (anel de foco)      | Sinal escuro `#B83300`               | Sinal `#FF5A1F`          |

   A troca dos nomes para os da marca nova (`fundo`, `superficie`, `destaque`) fica registrada como dívida, para uma tarefa própria.

3. **Tipografia.** `src/app/layout.tsx` carrega Space Grotesk (400, 500, 600 e 700) e IBM Plex Mono (400, 500 e 600) por `next/font/google`, no lugar da Geist. Títulos e texto usam Space Grotesk. Números, datas, contagens, rótulos e estimativas usam IBM Plex Mono com `tabular-nums`. Não há itálico.
4. **Regra do sinal.** O laranja aparece no máximo uma vez por tela, fora o logo: na demanda marcada como Agora. Hoje `--mcv-pulse` tem um único uso (o pulso do ícone); qualquer outro laranja é removido.
5. **Sem sombra e sem gradiente.** `--mcv-shadow` passa a `none`. A profundidade vem da troca de superfície, como a marca pede. O véu da janela (`--mcv-scrim`) continua, porque é um fundo e não uma sombra, com a cor ajustada para Noite.
6. **Ícone da marca.** `BrandIcon` desenha o M de cinco barras do `mc-icone-*.svg`, com as barras em `currentColor` e a última em `--mcv-pulse`. O tamanho mínimo continua 24 px.
7. **Nome.** "Moraes CodeVibe" vira "Moraes Coding" em `app-shell.tsx`, `entrar/page.tsx`, `layout.tsx` e `manifest.ts`, e nos testes que conferem esses textos. O nome do app, TrilhaJp3, não muda.
8. **PWA e favicon.** `public/icon.svg`, `src/app/apple-icon.png` e os 3 PNG de `public/icons/` são gerados de novo a partir do `mc-app-icone.svg`. `theme_color` e `background_color` do manifesto, e `viewport.themeColor`, passam a Gelo `#F2F2EE` no claro e Mata `#0C2A1E` no escuro.
9. **Arquivos da marca no repositório.** Entram em `docs/brand/moraes-coding/` só os 11 SVGs de logo, os 36 SVGs de ícone e o `tokens.json`. O manual, as pranchas e o zip ficam fora, porque o repositório é público e o manual traz o nome completo do Pedro.

## 3. Requisitos não funcionais

1. Contraste WCAG 2.1 AA nos dois temas: texto comum com 4,5:1, bordas de controle, foco e ícones com 3:1. `src/styles/contrast.test.ts` é atualizado para os valores novos e para conferir que Sinal (`#FF5A1F`) e Mostarda nunca são cor de texto sobre Gelo.
2. Fontes sem mudança de layout ao carregar: `next/font` com `display: swap` e fonte de reserva com métrica ajustada, como já é feito com a Geist.
3. Nenhuma dependência nova.
4. Todas as checagens do `CONSTRAINTS.md` continuam verdes, incluindo axe e o limite de tamanho do bundle.

## 4. Fora do escopo

1. Trocar os ícones de interface (os SVGs em linha de `demand-dialog`, `demands-board`, `theme-toggle`, `mode-toggle`, `capture-dialog` e `app-shell`) pelos 36 ícones novos. Eles entram no repositório agora e a troca vira uma tarefa própria.
2. Renomear a empresa na tabela `organizations` (a migração `20261026190000_moraes_codevibe` gravou "Moraes CodeVibe"). O nome não aparece na interface. Ver a pergunta 2 da seção 8.
3. Os componentes Kpi, GraficoBarras, Selo e Painel da marca: o app ainda não tem painel de números.
4. Renomear as variáveis `--mcv-*` (item 2.2).

## 5. Design: 3 propostas (`impeccable`)

Os tokens já vêm decididos pela marca. O que falta decidir é como a casca do app usa as duas superfícies. Cada proposta vem num arquivo HTML para o Pedro aprovar, conforme o `CLAUDE.md`.

- **A · Barra lateral em Mata (escolhida pelo Pedro em 2026-10-28; maquete em `https://claude.ai/artifact/Bab15FzZhbonEHyttbruE5`).** A barra lateral fica escura (Mata, texto Névoa), como o "topo de terminal de BI" da marca. O conteúdo fica em Gelo. O Sinal marca a demanda Agora.
- **B · Tudo em Gelo.** Barra lateral e conteúdo claros, separados por uma borda fina. A Mata aparece só no logo e nos títulos. É a opção mais calma.
- **C · Faixa superior em Mata.** Uma faixa escura fina no topo da área de conteúdo, com o título da página e o bloco Agora. A barra lateral fica clara.

No tema escuro as três ficam em Mata e Noite; a diferença entre elas está no tema claro.

## 6. Testes e critérios de aceitação

1. Unitário: `contrast.test.ts` com os pares novos nos dois temas; `typography.test.ts` confere Space Grotesk e IBM Plex Mono e que a Geist saiu; teste de `BrandIcon` confere 5 barras e a última com `data-pulse`.
2. Unitário: `manifest()` devolve as cores novas e o nome "Moraes Coding" na descrição.
3. E2E: os testes atuais passam sem mudança de comportamento; o axe passa nos dois temas em Retomar, Demandas, Projetos, demanda e login.
4. Busca: `grep -ri "codevibe" src e2e public` não encontra nada, exceto comentários históricos de origem.
5. Manual (Pedro): a tela de login e a Retomar, nos dois temas, batem com a proposta aprovada.

## 7. Fatias

1. Arquivos da marca em `docs/brand/moraes-coding/`, 3 propostas em HTML e escolha do Pedro. Cerca de 40 min (estimativa).
2. Tokens e contraste: `tokens.css`, `globals.css` (sombra, foco, véu) e `contrast.test.ts`. Cerca de 40 min.
3. Tipografia: `layout.tsx`, famílias, números em mono e `typography.test.ts`. Cerca de 40 min.
4. Ícone, nome e PWA: `BrandIcon`, textos, favicon, PNG e manifesto. Cerca de 40 min.
5. Casca da proposta escolhida, revisão final do `impeccable`, `DESIGN.md`, ADR 0007 (substitui as ADR 0004 e 0005) e `docs/STATUS.md`. Cerca de 45 min.

Total estimado: cerca de 3h30.

## 8. Riscos e perguntas abertas

1. **Risco: cache do ícone no iPad.** Depois da troca, é preciso remover o app da tela inicial e adicionar de novo.
2. **Pergunta: renomear a empresa no banco?** Uma migração nova faz `update public.organizations set name = 'Moraes Coding' where id = '5d35ad87-c91e-4d87-a95a-11d421149f19'`. Ela é reversível e não apaga dado. Recomendo fazer nesta tarefa, para o banco não divergir da marca.
3. **Risco: `check:floor`.** Trocar asserções de texto e de cor nos testes pode deixar o `check:floor` vermelho, como na T4 e na T5. Cada asserção trocada será listada na PR.
4. **Recuperação.** A tarefa só mexe em estilo, texto e imagens. Reverter a PR devolve a marca V2 inteira; a migração do item 8.2, se aprovada, tem o `--rollback` do `npm run db:migrate`.
