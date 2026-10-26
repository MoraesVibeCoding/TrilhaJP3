# ADR 0005: Marca V2 substitui a V1 no app

## Status
Aceita.

## Data
2026-10-23

## Contexto
O Pedro enviou a evolução da marca (`docs/brand/evolucao/`): ícone M em circuito com nó de pulso, paleta Floresta, Folha, Pulso lime e Âmbar, e Folha a 4,8:1. A revisão (`docs/brand/evolucao/REVISAO.md`) mediu os contrastes: o Pulso lime dá 1,29:1 e o Âmbar 2,70:1 sobre o papel claro.

## Decisão
Aplicar a V2 ao app (tokens, ícone, favicon). Regras:
- **Pulso lime** significa "Claude está trabalhando" e só aparece sobre fundo escuro ou com contorno Floresta de 2,5 px.
- **Âmbar** é só preenchimento com texto Tinta; nunca texto nem borda no claro. A borda do aviso de demonstração passou ao cinza-verde `#526350`.
- **Folha** não é cor de texto (4,497:1 sobre a Neblina).
- Fundo escuro do app passa a ser a Tinta `#0F1F14`.

## Alternativas consideradas
- **Manter a V1:** rejeitada pelo Pedro.
- **Usar o lime como acento geral:** rejeitada; reprova contraste no claro e enfraquece o significado "IA em ação".

## Consequências
- Testes em `src/styles/contrast.test.ts` travam os valores e os usos proibidos.
- O kit V1 em `docs/brand/` fica como histórico, sem alteração.
- O indicador "Claude trabalhando" ainda não existe; chega com o campo Executor.
