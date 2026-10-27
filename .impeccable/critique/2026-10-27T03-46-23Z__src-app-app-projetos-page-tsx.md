---
target: página /projetos
total_score: 37
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/home/user/TrilhaJP3/src/app/(app)/projetos/page.tsx"
target_fingerprint: "sha256:a39e87bc2f59c66d1a67b31a8368b70440f83f68c391622a4567f07dbc5a579f"
target_path: /home/user/TrilhaJP3/src/app/(app)/projetos/page.tsx
timestamp: 2026-10-27T03-46-23Z
slug: src-app-app-projetos-page-tsx
---
⚠️ DEGRADED: single-context (as regras desta sessão só permitem subagentes quando o usuário pede)

Alvo: src/app/(app)/projetos/page.tsx (+ src/components/project-list.tsx), validado contra o manual da marca V2 (kit de 2026-10-27). Detector injetado na sessão logada em 1280 px, 1280 px editando, 390 px e arquivados.

| # | Heurística | Nota | Achado |
|---|---|---|---|
| 1 | Visibilidade do estado | 4 | "Salvando…", aviso "Projeto salvo.", contagens por grupo e por aba |
| 2 | Linguagem do mundo real | 4 | estados e prioridades em pt-BR; voz da marca (frases curtas, sem exagero) |
| 3 | Controle e liberdade | 4 | Cancelar, Restaurar; arquivar é reversível |
| 4 | Consistência | 4 | botões, filetes e títulos do DESIGN.md; raios e títulos do kit V2 |
| 5 | Prevenção de erros | 3 | arquivar sem confirmação (reversível, com aviso); type=url no link |
| 6 | Reconhecer em vez de lembrar | 4 | rótulos visíveis, valores atuais no formulário |
| 7 | Flexibilidade e eficiência | 3 | sem ordenação nem atalho de teclado próprio |
| 8 | Estética e minimalismo | 4 | marca só nos títulos e no item atual; sem cartões repetidos |
| 9 | Recuperação de erros | 4 | erro por campo, foco no primeiro inválido, valores mantidos (corrigido) |
| 10 | Ajuda | 3 | estado vazio diz como começar; sem ajuda sobre estados |
| Total | | 37/40 | Excelente |

Auditoria: Acessibilidade 4, Desempenho 4, Tema 4, Responsivo 4, Integridade 3 = 19/20. Detector: 1 achado, overused-font (Geist em 100%): falso positivo, a Geist é decisão do Pedro de 2026-10-22 (PRODUCT.md). Integridade 3: o kit pede links em Folha; o app usa Floresta (mais contraste), divergência registrada.

Corrigidos nesta rodada: [P2] arquivar/restaurar anunciavam sucesso sem conferir o banco; [P2] erro de campo não levava o foco ao campo; [P2] botão flutuante cobria o último item no celular (todas as páginas); [P3] Restaurar esticado; [P3] prioridade sem nome para leitor de tela.

Abertos: [P3] sem ordenação; [P3] arquivar sem confirmação (reversível).
