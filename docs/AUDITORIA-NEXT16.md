# R2: auditoria do código contra os docs do Next 16

Data: 2026-10-23. Fonte: `node_modules/next/dist/docs/` (versão instalada, Next 16.4.2). Escopo desta passada: o que o app usa hoje. **Não** cobre rotas dinâmicas, `use cache`, manifest e metadados de PWA (T12), nem Server Actions: ainda não existem.

| Tema | Doc lido | Situação |
| --- | --- | --- |
| `cacheComponents` e `partialPrefetching` | `03-api-reference/05-config/01-next-config-js/cacheComponents.md` | `next.config.ts` liga as duas, como o doc manda. Nenhum `runtime` de rota no código (incompatível com o flag). |
| Navegação com `<Activity>` | `cacheComponents.md` (seção Navigation with Activity) e `02-guides/preserving-ui-state.md` | **Divergência encontrada e corrigida.** O Next esconde a rota ao navegar em vez de desmontá-la; os efeitos limpam e rodam de novo ao voltar. Na janela da demanda o foco voltava ao `BODY` em vez do botão que abriu. Corrigido em `demand-dialog.tsx` (opener guardado num `ref`), com teste unitário usando `<Activity>` e teste E2E de voltar e avançar. |
| Hidratação sem piscar o tema | guia "Preventing Flash Before Hydration" (lido na T1) | Script inline no `<head>` e `suppressHydrationWarning` no `<html>`, como o guia descreve. |
| `next/font` | guia de fontes (lido na migração para Geist) | `Geist` com `variable: "--font-geist"`, sem fonte extra. |
| Estado preservado em outras interações | `preserving-ui-state.md` | Janela da demanda: ao voltar, ela reabre modal, sem deixar nada travado (conferido no navegador: sem `inert` residual, `Esc` fecha). Atalho `F` do modo: o ouvinte de teclado é limpo e recriado com o efeito, sem duplicar. |

## Fora desta passada

- Metadados, `manifest` e ícones de instalação (T12).
- Cache de dados (`use cache`, `cacheLife`): o app ainda não busca dado remoto; entra com o Supabase (T2 em diante).
- `useRouter().bfcacheId`: o doc o trata como ferramenta de migração; não usamos.

## Risco que fica

A auditoria leu os docs que os temas acima citam, não a árvore inteira de `01-app`. Quando entrarem rotas dinâmicas e dados, reabrir com a mesma lista.
