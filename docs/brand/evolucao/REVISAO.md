# Revisão da evolução da marca (V2) contra o design do TrilhaJp3

Data: 2026-10-23. Fontes: o PDF desta pasta e o artefato de design `https://claude.ai/artifact/9KJch3JzimL176JVtLETBq` (4 pranchas: Revitalização, Logo, Cores e tipografia, Aplicações), cujos arquivos estão em `artefato/`. Os valores abaixo são os **exatos do artefato**, não amostras. Status: **decisões 1 a 5 aceitas e aplicadas ao app em 2026-10-23** (tokens, ícone, favicon, documentos). O kit original em `docs/brand/` não foi alterado.

## Arquivos salvos

- `tokens-v2.json`: cores, fontes, regras do logo e do pulso.
- `logo/`: ícone em SVG sobre papel, sobre floresta, em uma cor e a versão pequena (24 a 31 px, sem terminais).
- `artefato/`: o código das 4 pranchas, para consulta.

## Paleta V2 e contraste (calculado, confere com o declarado)

| Cor | Valor | Hoje no app | Pares calculados |
| --- | --- | --- | --- |
| Tinta | `#0F1F14` | `--mcv-ink #16241a` | sobre Pulso 12,67 |
| Floresta | `#1B4D2E` | `--mcv-forest #2b4a30` | sobre Papel 9,31; Papel sobre Floresta 9,31 |
| Folha | `#2F7D4B` | `--mcv-leaf #6f9959` (3,14 no papel) | sobre Papel 4,81; sobre Branco 5,05; sobre Neblina 4,50 (no limite) |
| Pulso | `#A6F26B` | não existe | sobre Floresta 7,23; sobre Tinta 12,67; **sobre Papel 1,29; sobre Neblina 1,20** |
| Neblina | `#EDF4E7` | `--mcv-mint #eef3e8` | quase igual |
| Papel | `#F8FAF5` | `--mcv-paper #f9faf6` | quase igual |
| Âmbar | `#D4892A` | `--mcv-gold #b9843f` | **sobre Papel 2,70**; Tinta sobre Âmbar 6,04; sobre Floresta 3,45 |

Tipografia do artefato: Fraunces (títulos), Inter (corpo), JetBrains Mono (rótulos e código).

## O que a revisão mostra

1. **A Folha nova resolve o problema antigo.** Passa de 3,14:1 para 4,81:1, então pode ser texto e link sobre o papel. O app já evitava a Folha antiga para texto.
2. **A Floresta nova é troca segura** para botão primário, foco e item atual; o contraste com o Papel é equivalente (9,43 hoje, 9,31 na V2) e a cor fica um pouco mais profunda.
3. **O Pulso lime não existe sobre fundo claro.** 1,29:1 no papel reprova texto e elemento de interface. A própria marca resolve no logo sobre papel: o ponto lime ganha contorno Floresta. No app vale o mesmo: lime só sobre Floresta ou Tinta, ou com contorno Floresta de 2,5 px.
4. **O Âmbar reprova como texto ou contorno sobre papel (2,70:1).** Só serve como preenchimento com texto Tinta (6,04:1). Hoje o `--mcv-gold` faz a borda tracejada do aviso de dados de demonstração; com o novo valor a borda cai para 2,70:1. Decorativa, mas precisa de decisão.
5. **Folha sobre Neblina dá 4,50:1**, exatamente no limite. Em cartão menta, usar Floresta para texto pequeno.
6. **O modo escuro da V2 só define a Tinta `#0F1F14` e os apoios** (`#B4C5AF`, `#C9DBC3`, linha `#2C4733`). Falta o mapeamento completo do app (cartão, linha, estado). O de hoje (`#141d16`) funciona; alinhar à Tinta é opcional.
7. **A regra de uso do Pulso** no artefato é "IA e destaque" e "uma vez por peça" no feed. Para o app proponho mais estreito: **lime = Claude está trabalhando**, nada mais. Casa com o campo Executor adiado e mantém o app calmo.

## Conflito a decidir: tipografia

O artefato volta a Fraunces, Inter e JetBrains Mono, exatamente as fontes do kit V1 que o Pedro dispensou no app em 2026-10-22 ("não trouxe visão de prêmio, modernidade") em favor do Geist. A V2 não muda isso por si. Proposta: Geist no app, Fraunces só no logotipo e em material de marca.

## Decisões que dependem do Pedro

1. A V2 substitui a V1 no app? (`PRODUCT.md` diz que o kit é vinculante.)
2. O lime fica restrito a "Claude trabalhando"?
3. Âmbar: aceitar só como preenchimento com texto Tinta, e trocar a borda do aviso de demonstração?
4. Tipografia: manter Geist no app?
5. Modo escuro: alinhar o fundo à Tinta `#0F1F14`?

## Plano depois da resposta (cada passo com teste e commit)

1. Tokens em `src/styles/tokens.css` com os valores acima; os testes de contraste cobrem os pares.
2. Logo na casca, no cabeçalho do celular e no favicon (versão pequena abaixo de 32 px).
3. Indicador "Claude trabalhando" (3 propostas via `impeccable`), junto com o campo Executor.
4. Atualizar `PRODUCT.md`, `DESIGN.md` e `.impeccable/design.json`.

## Adendo de 2026-10-26: artefato com 8 pranchas

O Pedro enviou a versão completa do artefato (`Moraes-CodeVibe-Evolucao-do-Branding.html` nesta pasta; texto em `fundamentos-v2.md`). Lida sem executar o script da página: os arquivos do pacote foram descompactados como dados.

1. **Pranchas 01 a 04 (Revitalização, Logo, Cores e tipografia, Aplicações): sem mudança.** Cores, contrastes, tipografia e regras do logo batem com `tokens-v2.json` e com o que já está no app. Nada a trocar em `src/styles/tokens.css`.
2. **Pranchas novas:** 05 Posicionamento, 06 Personalidade e voz, 07 Mensagem (BrandScript) e 08 Regras de uso. São da marca do estúdio, voltadas a lojistas; o app as usa só como voz de interface e regras de cor e logo (resumo em `PRODUCT.md`, Brand Commitments).
3. **Cores a mais no arquivo** (`#9A3B2E` e `#8A5410`) são só os rótulos "Não" e "Só ≥ 24 px" da prancha 08, não cores da paleta.
4. **Diferenças mantidas de propósito:** tipografia Geist no app (decisão de 2026-10-22; Fraunces só no logotipo e material de marca) e Pulso restrito a "Claude está trabalhando" (a marca permite IA ou número principal, uma vez por peça).
5. **Dados pessoais:** em 2026-10-26, antes de o repositório ficar público, o telefone e o e-mail do cartão da prancha 04 (no arquivo original e em `artefato/`) e de `docs/brand/tokens/tokens.json` foram trocados por dados fictícios: `+55 (00) 0 0000-0000` e `contato@exemplo.com.br`.
