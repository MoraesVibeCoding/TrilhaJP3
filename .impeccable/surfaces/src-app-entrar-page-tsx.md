---
version: 1
slug: "src-app-entrar-page-tsx"
primary_target: "src/app/entrar/page.tsx"
related_targets: ["src/components/login-form.tsx"]
---

# Surface brief: Tela de entrada

Modo: Operate. Fora da casca do app. Proposta B (mesa dividida) escolhida pelo Pedro em 2026-10-26, entre 3 maquetes (`.impeccable/mocks/t3/opcoes.png`).

## Job and audience
Pedro entra no app depois de a sessão expirar ou em um aparelho novo. É uma passagem: e-mail, senha, Entrar, e volta para onde estava (`?de=`).

## Scope and boundaries
- Faixa da marca à esquerda (2fr, mínimo 18rem) com o ícone, o nome e a frase "Projetos e demandas da Moraes Coding."; formulário no Gelo à direita, até 22rem.
- A faixa usa o chrome do topo: Mata no claro, Noite no escuro, texto e logo em Névoa.
- Abaixo de 45rem a faixa vira uma barra com o ícone e o nome; a frase some.
- Erro único e genérico ("E-mail ou senha incorretos. Confira e tente de novo."), no padrão da captura: texto em negrito sobre Névoa, sem vermelho fora da paleta. O e-mail volta ao campo; a senha, não.
- Pendente: o botão vira "Entrando…" e fica desativado.
- Sair fica na barra lateral do app, logo abaixo da navegação.

## Direction contract
THESIS: a tela é uma porta da casa, não um anúncio: a marca aparece uma vez, na faixa, e o formulário não disputa atenção.
OWN-WORLD (marca Moraes Coding desde 2026-10-28; tokens e regras em DESIGN.md): Gelo no corpo, topo e barra lateral em Mata (Noite no escuro), filetes de 1px, Space Grotesk no texto e títulos (700 e -0.02em), IBM Plex Mono em números e rótulos, sem sombras, foco de 3px laranja, laranja (destaque) uma vez por tela, botão alta e botões fantasma.
FINISH: auditoria e critique do impeccable em 2026-10-26 (19/20 e 34/40), achados corrigidos no commit bf70de0.
