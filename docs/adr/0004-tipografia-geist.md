# ADR 0004: Geist como única família tipográfica do app

## Status
Aceita. Exceção deliberada ao kit de marca V1.

## Data
2026-10-22

## Contexto
O kit de marca V1 pedia Fraunces (títulos), Inter (texto) e JetBrains Mono. O Pedro viu a tela com essas fontes e disse que elas não traziam "visão de prêmio, modernidade". Escolheu a opção "Geist" entre as propostas.

## Decisão
O app usa **Geist** em títulos e texto, com peso 600 e `letter-spacing: -0.02em` nos títulos. Não se mistura outra família. A Fraunces fica só no logotipo e em material de marca.

## Alternativas consideradas
- **Manter Fraunces, Inter e JetBrains Mono (kit V1):** rejeitada pelo Pedro.
- A evolução de marca V2 (ADR 0005) usa de novo essas três fontes em seus materiais; isso não muda a decisão do app.

## Consequências
- `PRODUCT.md`, `DESIGN.md` e `docs/SPEC.md` registram a exceção.
- Um teste (`src/styles/typography.test.ts`) impede outra família no CSS.
