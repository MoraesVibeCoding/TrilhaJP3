---
version: 1
slug: "src-app-app-projetos-page-tsx"
primary_target: "src/app/(app)/projetos/page.tsx"
related_targets: ["src/components/project-list.tsx"]
---

# Surface brief: Projetos

Modo: Operate. Proposta A (grupos por estado), escolhida pelo Pedro em 2026-10-27 entre 3 maquetes (`.impeccable/mocks/t4/opcoes.png`), sobre o kit de marca V2 oficial.

## Job and audience
Pedro cadastra e revisa os projetos reais da empresa: o que está em andamento, o que é ideia, o que parou. Escala: dezenas de projetos.

## Scope and boundaries
- Título "Projetos" e "Novo projeto" no topo; abas "Ativos (N)" e "Arquivados (N)" como links (`?arquivados=1`).
- Ativos agrupados por estado, nesta ordem: Em andamento, Ideia, Pausado, Concluído; grupo vazio some. Cada linha: nome, prioridade, link (só o endereço, abre em nova aba) e "Editar".
- Editar troca a própria linha pelo formulário (nome, estado, prioridade, descrição, link), sem janela por cima. Erro por campo, foco no primeiro inválido, valores mantidos. Arquivar fica à esquerda, longe de Salvar; é reversível em Arquivados ("Restaurar").
- Avisos ("Projeto salvo.", "“X” foi para Arquivados.") na faixa de aviso do Quadro.
- As outras telas seguem com dados de demonstração até a T5.

## Direction contract
THESIS: a página responde "o que está andando?" antes de qualquer outra coisa; editar acontece no lugar.
OWN-WORLD (marca Moraes Coding desde 2026-10-28; tokens e regras em DESIGN.md): Gelo no corpo, topo e barra lateral em Mata (Noite no escuro), filetes de 1px, Space Grotesk no texto e títulos (700 e -0.02em), IBM Plex Mono em números e rótulos, sem sombras, foco de 3px laranja, laranja (destaque) uma vez por tela, botão alta e botões fantasma.
FINISH: critique 37/40 e auditoria 19/20 em 2026-10-27; achados P2 corrigidos.
