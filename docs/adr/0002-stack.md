# ADR 0002: Next.js 16, TypeScript estrito, Supabase e Vercel

## Status
Aceita.

## Data
2026-10-21

## Contexto
Sistema de gestão web, instalável como PWA, usado no computador, no iPad e no celular, com login obrigatório, banco relacional e arquivos anexados. A stack está registrada em `PRODUCT.md` e `docs/SPEC.md`.

## Decisão
- Front e servidor: **Next.js 16** (App Router, `cacheComponents` e `partialPrefetching` ligados) com **TypeScript estrito**.
- Dados, login e arquivos: **Supabase** (Postgres, Auth, Storage).
- Hospedagem: **Vercel** (ver ADR 0001).
- Qualidade: **Vitest** e Testing Library (unidade e componente), **Playwright** (E2E), ESLint, Prettier e CI no GitHub Actions.

## Alternativas consideradas
As fontes do projeto não registram alternativas avaliadas além da hospedagem (ADR 0001). Não invento aqui.

## Consequências
- O Next 16 difere do que costuma estar em material antigo; `AGENTS.md` manda ler `node_modules/next/dist/docs/` antes de codar. A auditoria está em `docs/AUDITORIA-NEXT16.md`.
- Com `cacheComponents`, rotas escondidas por navegação continuam montadas (`<Activity>`); componentes com efeitos devem tolerar isso.
- O Playwright roda contra o servidor de desenvolvimento (`npm run dev`), não contra o build de produção.
