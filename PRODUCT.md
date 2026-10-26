# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pedro Moraes, dono da Moraes CodeVibe e único usuário da v1. Usa o app principalmente no computador e no iPad, em sessões de planejamento e revisão: priorizar, quebrar demandas e revisar o que está parado. O celular serve só para consulta. Outros usuários e empresas virão depois (banco multiempresa desde o início).

## Product Purpose

TrilhaJp3 é o sistema de gestão da Moraes CodeVibe. A v1 é o módulo Projetos e demandas: o Pedro cadastra os projetos em andamento e organiza as demandas de cada um, com subtarefas, etiquetas, comentários, anexos e histórico de alterações, numa tela única de visão geral. Sucesso da v1: o Pedro trabalha nele no lugar de ferramentas soltas.

## Positioning

Ferramenta com a marca e os dados da própria Moraes CodeVibe, sem depender de serviço de terceiros para guardar o trabalho da empresa.

## Operating Context

Interface em português do Brasil. Site responsivo instalável (PWA) no computador, iPad e celular. Login obrigatório. Anexos de imagens, PDF e documentos de escritório, até 10 MB.

## Capabilities and Constraints

- Stack: Next.js 16, TypeScript, Supabase (Postgres, Auth, Storage), Vercel, Vitest, Playwright.
- Multiempresa por `organization_id` com RLS em todas as tabelas.
- Demandas com três estados (a fazer, fazendo, feito); subtarefas de um nível.
- Fora da v1: cadastro de empresas, cobrança, outros módulos, notificações, modo offline, importação, integrações, app de loja.
- Domínio `trilhajp3.com` ainda não comprado; a v1 usa o endereço padrão da Vercel.
- Marca não registrada no INPI (pedido pendente).

## Brand Commitments

Nome do app: TrilhaJp3. Empresa: Moraes CodeVibe. A **marca V2** (evolução decidida pelo Pedro em 2026-10-23) substitui a V1 no app: ícone M em circuito com nó de pulso, paleta Floresta, Folha, Pulso lime e Âmbar, Folha a 4,8:1. Tokens e logos em `docs/brand/evolucao/`; o kit V1 em `docs/brand/` fica como histórico e não foi alterado. Regras: o Pulso lime significa "Claude está trabalhando" e só aparece sobre fundo escuro ou com contorno Floresta; o Âmbar é só preenchimento com texto Tinta. **Exceção de tipografia, decidida em 2026-10-22: o app usa Geist** (títulos e texto) no lugar de Fraunces, Inter e JetBrains Mono, para um visual mais moderno; a Fraunces fica só no logotipo e em material de marca.

**Voz da marca V2** (fundamentos completos em `docs/brand/evolucao/fundamentos-v2.md`, recebidos em 2026-10-26): "fala como quem sabe, não como quem vende". Sábio 70% (explica o porquê, prova com dados, sem soar professoral) e Mago 30% (a virada com IA, que aparece pouco, sem prometer mágica). Tom: um engenheiro experiente explicando para alguém ocupado: direto, gentil, com números. No app, isso vale para todo texto de interface: frases curtas, números concretos quando existem, nenhum jargão sem uma frase explicando, nada de inglês sem necessidade, nada de exagero ("turbinar", "revolucionário", "faz tudo sozinha", "sinergia"). O Pulso lime, que a marca usa "uma vez por peça, ligado a IA ou ao número principal", fica no app restrito a "Claude está trabalhando" (decisão de 2026-10-23). Regras de uso que o app segue: Folha sobre Neblina só a partir de 24 px (abaixo, Floresta); Âmbar sobre Floresta, evitar; logo com no mínimo 24 px, respiro igual à altura do ícone, sem distorcer, sem trocar a cor do pulso e nunca sobre fundo Pulso.

## Evidence on Hand

Kit de marca em `docs/brand/` (PDF de diretrizes, logos, tokens) e a evolução V2 em `docs/brand/evolucao/` (tokens, logos, fundamentos com posicionamento, voz, mensagem e regras de uso). Não há depoimentos, clientes, métricas ou capturas de tela; nada disso deve ser inventado. O case "checkout 32% mais rápido" e o painel "Jornada Azul" das pranchas são simulados e não servem como prova.

## Product Principles

1. Poucas coisas, bem feitas: a v1 cobre só projetos e demandas.
2. Os dados são da empresa: isolamento por empresa em todas as camadas.
3. Qualidade antes de prazo: cada fatia só avança com teste passando.
4. A marca Moraes CodeVibe aparece nos detalhes, não em enfeite.

## Accessibility & Inclusion

WCAG 2.1 AA: navegação por teclado e leitores de tela. Interface em pt-BR.
