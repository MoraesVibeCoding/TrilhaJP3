# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pedro, dono da Moraes Coding e único usuário da v1. Usa o app principalmente no computador e no iPad, em sessões de planejamento e revisão: priorizar, quebrar demandas e revisar o que está parado. O celular serve só para consulta. Outros usuários e empresas virão depois (banco multiempresa desde o início).

## Product Purpose

Trilha JP3 é o sistema de gestão da Moraes Coding. A v1 é o módulo Projetos e demandas: o Pedro cadastra os projetos em andamento e organiza as demandas de cada um, com subtarefas, etiquetas, comentários, anexos e histórico de alterações, numa tela única de visão geral. Sucesso da v1: o Pedro trabalha nele no lugar de ferramentas soltas.

## Positioning

Ferramenta com a marca e os dados da própria empresa (hoje a Moraes Coding), sem depender de serviço de terceiros para guardar o trabalho da empresa. Vai ser comercializada: cada empresa cliente vê o próprio nome no topo.

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

Nome do app: **Trilha JP3** (produto). Empresa: **Moraes Coding** (tarefa de marca, `tasks/tm-spec.md`, 2026-10-27 e 2026-10-28). O app segue o design system da Moraes Coding (artifact `CeaPqHJ1X5V61mPWYFZnTN`): tokens semânticos com tema claro (Gelo) e escuro (Mata), Space Grotesk no texto e IBM Plex Mono em números e rótulos, logo de cinco barras com a barra de hoje em laranja, sem sombras nem gradientes, e o laranja uma vez por tela, no número que importa. O topo mostra o nome da empresa do usuário, lido do banco; logo e cores por cliente ficam para depois. Na dúvida de marca, vale o manual; as exceções aprovadas estão em `tasks/tm-spec.md`, seção 10.

**Voz:** a do design system da Moraes Coding. No app: frases curtas, número antes de adjetivo, ação no infinitivo, termo técnico só com uma frase explicando, nada de inglês sem necessidade, nada de exagero nem de nome de fornecedor na interface.

## Evidence on Hand

O pacote de marca da Moraes Coding fica fora do repositório (o manual traz dados pessoais); entram só SVGs e tokens, em `docs/brand/moraes-coding/` e `src/styles/tokens.css`. Os kits antigos (V1 e V2 da Moraes CodeVibe) seguem em `docs/brand/` como histórico. Não há depoimentos, clientes, métricas ou capturas de tela; nada disso deve ser inventado.

## Product Principles

1. Poucas coisas, bem feitas: a v1 cobre só projetos e demandas.
2. Os dados são da empresa: isolamento por empresa em todas as camadas.
3. Qualidade antes de prazo: cada fatia só avança com teste passando.
4. A marca da empresa aparece nos detalhes, não em enfeite.

## Accessibility & Inclusion

WCAG 2.1 AA: navegação por teclado e leitores de tela. Interface em pt-BR.
