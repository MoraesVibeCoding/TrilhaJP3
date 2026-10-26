# ADR 0006: Três visões da Demandas; mover no Quadro por menu, sem arrastar

## Status
Aceita.

## Data
2026-10-23

## Contexto
A página Demandas precisa mostrar as mesmas demandas de jeitos diferentes. O Pedro escolheu entre três propostas por visão, com esboços. Uma exigência de acessibilidade pesa no Quadro: mover por arrastar precisa de alternativa sem arrastar (WCAG 2.5.7, da 2.2; adotada por segurança no AA).

## Decisão
- **Tabela:** versão A, com a faixa de contagens como filtro de estado (aprovada em 2026-10-22).
- **Por projeto:** cartões de projeto (proposta B), com as 2 primeiras demandas e "Ver mais N".
- **Quadro:** colunas A fazer, Fazendo e Feito (proposta A); **mover por um `select` nativo "Mover para…"**, com a confirmação à vista e anunciada, e foco devolvido ao cartão. Sem arrastar.
- A escolha da visão fica salva no navegador, validada contra adulteração.

## Alternativas consideradas
- **Quadro com arrastar e setas (B):** rejeitada por ora; mais código, mais testes e duas formas para a mesma ação. Pode entrar depois usando a mesma função de mover.
- **Quadro em faixas por projeto (C):** rejeitada; muita rolagem e não cabe no iPad em pé.
- **Por projeto como blocos recolhíveis:** foi a ideia inicial; trocada pelos cartões quando o Pedro escolheu a proposta B.

## Consequências
- O estado das demandas vive só na memória do navegador até a T5 e a T7 (atalho registrado no código).
- Quadro em 3 colunas só a partir de 60rem; abaixo empilha.
