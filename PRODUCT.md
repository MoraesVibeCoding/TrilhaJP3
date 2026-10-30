# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pedro Moraes, dono da Moraes Coding e único usuário da v1. Usa o app principalmente no computador e no iPad, em sessões de planejamento e revisão: priorizar, quebrar demandas e revisar o que está parado. O celular serve só para consulta. Outros usuários e empresas virão depois (banco multiempresa desde o início).

## Product Purpose

TrilhaJp3 é o sistema de gestão da Moraes Coding. A v1 é o módulo Projetos e demandas: o Pedro cadastra os projetos em andamento e organiza as demandas de cada um, com subtarefas, etiquetas, comentários, anexos e histórico de alterações, numa tela única de visão geral. Sucesso da v1: o Pedro trabalha nele no lugar de ferramentas soltas.

## Positioning

Ferramenta com a marca e os dados da própria Moraes Coding, sem depender de serviço de terceiros para guardar o trabalho da empresa.

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

Nome do app: TrilhaJp3. Empresa: **Moraes Coding** (antes Moraes CodeVibe). A marca Moraes Coding, direção B · Gráfico, substitui a V2 no app desde 2026-10-28 (ADR 0007, `tasks/marca-spec.md`): Gelo e Mata, M de cinco barras com a barra de hoje no Sinal, Space Grotesk em títulos e texto e IBM Plex Mono só em números. Tokens, logos e ícones em `docs/brand/moraes-coding/`; a V2 (`docs/brand/evolucao/`) e a V1 (`docs/brand/`) ficam como histórico. Regras: o Sinal laranja aparece uma vez por tela, como preenchimento (no app, o passo atual da demanda Agora), e é a cor do foco; sobre o Gelo vale o Sinal escuro `#B83300`, nunca o `#FF5A1F`; Mostarda é só preenchimento com texto Noite; sem sombras e sem gradientes; a barra lateral é a superfície escura (proposta A).

**Voz da marca** (guia completo na seção "Voz e escrita" do design system Moraes Coding): "fala como quem sabe, não como quem vende". Tom: um engenheiro experiente explicando para alguém ocupado: direto, gentil, com números. No app, isso vale para todo texto de interface: frases curtas, número antes de adjetivo, nenhum jargão sem uma frase explicando, nada de inglês sem necessidade, nada de exagero ("turbinar", "revolucionário", "faz tudo sozinha", "sinergia"). Em texto corrido escreva "Moraes Coding", nunca "moraes.coding" (só no desenho do logo). Logo com no mínimo 24 px, sem distorcer, sem trocar a ordem das barras.

## Evidence on Hand

Marca atual em `docs/brand/moraes-coding/` (tokens, logos, ícones); histórico em `docs/brand/evolucao/` (V2) e `docs/brand/` (V1). Não há depoimentos, clientes, métricas ou capturas de tela; nada disso deve ser inventado. O case "checkout 32% mais rápido" e o painel "Jornada Azul" das pranchas são simulados e não servem como prova.

## Product Principles

1. Poucas coisas, bem feitas: a v1 cobre só projetos e demandas.
2. Os dados são da empresa: isolamento por empresa em todas as camadas.
3. Qualidade antes de prazo: cada fatia só avança com teste passando.
4. A marca Moraes Coding aparece nos detalhes, não em enfeite.

## Accessibility & Inclusion

WCAG 2.1 AA: navegação por teclado e leitores de tela. Interface em pt-BR.
