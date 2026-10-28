---
target: app inteiro depois da marca Moraes Coding
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/home/user/TrilhaJP3/src/app/(app)/page.tsx"
target_fingerprint: "sha256:7f1c43c95d62a21ab12169fd7cfbd3cc3798227ee2077ec5567990de64ddd992"
target_path: /home/user/TrilhaJP3/src/app/(app)/page.tsx
timestamp: 2026-10-28T12-30-25Z
slug: src-app-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser). Depois das fatias 1 a 3 da marca Moraes Coding.

Heurísticas (Nielsen): 1 Status 3 · 2 Mundo real 3 · 3 Controle 3 · 4 Consistência 3 · 5 Prevenção 3 · 6 Reconhecer 3 · 7 Eficiência 3 · 8 Minimalista 3 · 9 Recuperação 3 · 10 Ajuda 2 = 29/40 (Bom).

Especificidade: passa. O app se lê como Moraes Coding (chrome em Mata, logo de barras, mono só em dado, laranja uma vez por tela). Detector: CLI 0 achados; no browser só overused-font (Space Grotesk, a fonte do manual: falso positivo). Contraste: 0 textos abaixo de 4,5:1 em 20 combinações; sem rolagem horizontal; sem alvo real abaixo de 44px.

Prioridades:
- [P1] Cabeçalho da tabela encavalado no iPad (mono maiúsculo) — CORRIGIDO: botão de ordenar herda 0,75rem/500, 0,06em, coluna Prioridade 16% (E2E novo a 1024).
- [P2] Botão primário some ao passar o mouse no escuro (hover Mata sobre fundo Mata) — lacuna do manual; decisão do Pedro com HTML.
- [P2] PRODUCT.md e superfícies na marca antiga — CORRIGIDO.
- [P3] Mono em frases inteiras ("Mostrando 9 de 9", "1 de 3 demandas feitas") — mantido: está na proposta A aprovada.
- [P3] Celular, página da demanda: ações recuadas ~12px (já existia).

Personas: Pedro no iPad (filtros ocupam 3 linhas; Quadro com 9 selects); Sam (item atual da lateral só por peso: Noite sobre Mata 1,19:1; aria-current presente).
