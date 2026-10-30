# ADR 0007: Marca Moraes Coding substitui a V2 no app

## Status
Aceita. Substitui a ADR 0004 (tipografia Geist) e a ADR 0005 (marca V2).

## Data
2026-10-28

## Contexto
A empresa passou a se chamar Moraes Coding, com a direção visual B · Gráfico: Gelo, Mata, um único Sinal laranja, Space Grotesk e IBM Plex Mono, e o M de cinco barras. O Pedro decidiu trocar a marca do app depois da T5 (`tasks/marca-spec.md`, aprovada em 2026-10-28). Fonte: o design system "Moraes Coding" no claude.ai; os tokens, os 11 logos e os 36 ícones estão em `docs/brand/moraes-coding/`.

## Decisão
- Tokens da marca nova nos temas Claro (Gelo) e Escuro (Mata). Os nomes `--mcv-*` continuam, com a correspondência no topo de `src/styles/tokens.css`.
- Space Grotesk em títulos e texto; IBM Plex Mono só em números; sem itálico.
- O sinal laranja aparece uma vez por tela, como preenchimento: o passo atual da demanda Agora. É também a cor do anel de foco (3 px). Sobre o Gelo vale o Sinal escuro `#B83300`; o Sinal `#FF5A1F` só sobre a Mata e a Noite.
- Sem sombras e sem gradientes.
- Casca na proposta A, escolhida pelo Pedro: a barra lateral é sempre a superfície escura.
- A empresa no banco passa a se chamar Moraes Coding (migração `20261029120000_moraes_coding`, reversível).

## Alternativas consideradas
- **Renomear as variáveis para os nomes da marca nova (`fundo`, `destaque`):** adiada; reescreveria 212 referências sem mudar nada na tela.
- **Propostas B (tudo em Gelo) e C (faixa superior em Mata):** rejeitadas pelo Pedro em 2026-10-28.

## Consequências
- `src/styles/contrast.test.ts` e `src/styles/typography.test.ts` travam a paleta, os contrastes, as fontes e os usos proibidos.
- A V2 (`docs/brand/evolucao/`, `docs/brand/v2-kit/`) e a V1 (`docs/brand/`) ficam como histórico.
- Os 36 ícones de interface entram no repositório, mas a troca dos SVGs em linha da interface fica para uma tarefa própria.
