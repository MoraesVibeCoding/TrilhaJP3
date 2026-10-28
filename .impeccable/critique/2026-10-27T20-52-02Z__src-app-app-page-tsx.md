---
target: app inteiro (Retomar, Demandas, demanda, Projetos, Entrar)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/home/user/TrilhaJP3/src/app/(app)/page.tsx"
target_fingerprint: "sha256:7f1c43c95d62a21ab12169fd7cfbd3cc3798227ee2077ec5567990de64ddd992"
target_path: /home/user/TrilhaJP3/src/app/(app)/page.tsx
timestamp: 2026-10-27T20-52-02Z
slug: src-app-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

Heurísticas (Nielsen): 1 Status 3 · 2 Mundo real 3 · 3 Controle 3 · 4 Consistência 2 · 5 Prevenção 3 · 6 Reconhecer 3 · 7 Eficiência 3 · 8 Minimalista 3 · 9 Recuperação 3 · 10 Ajuda 2 = 28/40 (Bom). Medido antes do lote da fatia 1.

Especificidade: estrutura autoral (bloco Agora, Foco/F, captura/C, Mover para… nativo, página em 3 colunas); pele intercambiável e obsoleta (Geist, verde pastel). Detector antes: 1 overused-font (Geist) por rota; depois do lote: 0 achados no CLI.

Prioridades:
- [P1] Telas na marca antiga — RESOLVIDO na fatia 1 (tokens, fontes, botões, foco, raios, sem sombra). Pendente: ícone/logo/nome (fatias 2 e 3).
- [P1] Sem âncora: nenhum número herói e dois primários por tela — destaque aplicado (Passo N de M, contagem de Fazendo); pendente: "Nova demanda" como fantasma (decisão do Pedro).
- [P2] Estados vazios gritam ("Sem subtarefas" em 28px) e não há como criar subtarefa (demand-detail.tsx:90-95).
- [P2] Barra de Demandas com 13 controles; selects em 13px (zoom no iOS); dois padrões de abas.
- [P3] Linhas largas sem rótulo em Projetos e Retomar.

Personas: Pedro no iPad (sem criar subtarefa, sem sinal de demanda parada, prioridade só pela página inteira); Alex (sem busca, sem lote); Sam (bem servido; foco agora 3px).
Menores: alvos .resume-open com 24px de altura (passa WCAG 2.5.8 AA, abaixo dos 44px do DESIGN.md); botão flutuante cobre selo no celular; DS sem ícones de sol, lua e alvo; "Redefina pelo painel do Supabase".
