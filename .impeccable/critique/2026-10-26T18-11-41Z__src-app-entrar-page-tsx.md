---
target: tela /entrar
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/home/user/TrilhaJP3/src/app/entrar/page.tsx"
target_fingerprint: "sha256:8b009c2248fcaa06b63f568d161cfd6541f06062d50dbc79f542493c5034180b"
target_path: /home/user/TrilhaJP3/src/app/entrar/page.tsx
timestamp: 2026-10-26T18-11-41Z
slug: src-app-entrar-page-tsx
---
⚠️ DEGRADED: single-context (as regras desta sessão só permitem subagentes quando o usuário pede)

Alvo: src/app/entrar/page.tsx (+ login-form, Sair na casca). Estado avaliado: depois das correções do commit bf70de0.

| # | Heurística | Nota | Achado |
|---|---|---|---|
| 1 | Visibilidade do estado | 3 | "Entrando…" e aviso com role=alert; o botão desativado tira o foco do teclado durante o envio |
| 2 | Linguagem do mundo real | 4 | pt-BR curto, sem jargão |
| 3 | Controle e liberdade | 3 | sem mostrar/ocultar senha |
| 4 | Consistência | 4 | tokens, botão primário e aviso iguais aos da captura |
| 5 | Prevenção de erros | 3 | type=email e required; sem aviso de Caps Lock |
| 6 | Reconhecer em vez de lembrar | 4 | rótulos visíveis, autocomplete para gerenciador de senhas |
| 7 | Flexibilidade e eficiência | 3 | Enter envia, autopreenchimento funciona; volta para ?de= |
| 8 | Estética e minimalismo | 4 | marca uma vez, formulário limpo |
| 9 | Recuperação de erros | 3 | erro genérico por segurança; e-mail mantido (corrigido) |
| 10 | Ajuda | 3 | nota de senha cita o painel do Supabase (serve ao Pedro, não a outros usuários) |
| Total | | 34/40 | Bom |

Especificidade: própria do produto (faixa e ícone V2, frase da Moraes CodeVibe, mesa dividida como a casca B).

Prioritários (corrigidos em bf70de0): [P1] Sair escondido (pé da barra lateral, fora da tela; no celular sob o botão flutuante). [P1] E-mail apagado depois do erro (reset do React 19). [P3] espaço extra do aviso vazio; [P3] palavra solta na nota; [P3] frase da faixa em 4 linhas no iPad retrato.

Abertos: [P3] foco perdido com o botão desativado durante o envio; [P3] sem mostrar senha; [P3] "Moraes CodeVibe" no pé da barra lateral fica sob o botão flutuante no celular (anterior à T3).
