# T5b: demanda em página inteira

Status: **aprovada pelo Pedro em 2026-10-25; em construção.** Escolhas do Pedro em 2026-10-25: uso para trabalho longo, o endereço muda sempre que a janela abre, as alterações ficam salvas no navegador até a T5, proposta **A (três colunas)**. Maquetes em `.impeccable/mocks/t5b/` (local, fora do Git).

## 1. Objetivo

O Pedro abre uma demanda numa página própria, com endereço fixo (`/demandas/d1`), para sessões longas de planejamento: subtarefas, comentários, anexos e histórico abertos ao mesmo tempo. A janela continua sendo o jeito rápido de abrir a demanda.

## 2. Requisitos funcionais

1. Rota `/demandas/[id]`. Recarregar a página ou abrir o link copiado mostra a página inteira.
2. Topo: caminho "Demandas / {projeto}" (o primeiro é link para `/demandas`), título (h1), estado, projeto, prioridade, última atividade, "Marcar como Agora" ou "Tirar de Agora" e "Copiar link".
3. Corpo em três colunas (proposta A): Subtarefas | Agora (passo atual, "Passo N de M", filete, "Concluir passo") e Comentários | Anexos e Histórico. Todos os grupos abertos.
4. Abrir a janela em Retomar ou em Demandas troca o endereço para `/demandas/{id}`. Fechar a janela, ou o botão Voltar do navegador, volta ao endereço anterior e fecha a janela. Avançar reabre a janela.
5. A janela ganha o link "Abrir em página inteira" no topo, ao lado de Fechar.
6. Concluir passo, Agora e Mover para ficam salvos no navegador. A página inteira, a janela, Retomar e Demandas mostram o mesmo estado, também depois de recarregar.
7. Demanda criada pela captura rápida também abre em página inteira.
8. Id desconhecido: página diz "Demanda não encontrada." com link para Demandas.
9. Modo Foco: só Subtarefas e Agora; sem "Marcar como Agora". Modo Completo: tudo.

## 3. Requisitos não funcionais

1. WCAG 2.1 AA: um só h1, ordem de leitura Subtarefas, Agora, Comentários, Anexos, Histórico; foco visível; alvos de 44px; "Copiar link" confirma num `role="status"` ("Link copiado.").
2. Responsivo: as colunas seguem a largura da área de conteúdo (container query), não a da tela, porque a barra lateral e o Foco mudam essa largura. 3 colunas com 60rem ou mais de conteúdo (1440px de tela); 2 colunas com 32rem ou mais (iPad em pé, 820px), Subtarefas e Agora com Comentários, e Anexos e Histórico embaixo; 1 coluna abaixo disso (celular). A página nunca rola na horizontal. Ajustado na construção, 2026-10-26.
3. Sem dependência nova. Tokens `--mcv-*` e componentes existentes (`StepProgress`, `badge`, `secondary-button`, `primary-button`, `detail-group`).
4. Claro e escuro com os mesmos papéis de cor.

## 4. Arquitetura e contratos

1. `src/app/demandas/[id]/page.tsx`: componente de servidor. `generateStaticParams` com os ids de demonstração; outros ids renderizam no primeiro pedido (para a captura rápida). Passa `id` a um componente de cliente.
2. `src/components/demand-page.tsx` (novo, cliente): acha a demanda em demonstração mais capturadas e reaproveita os blocos de `DemandDetail`.
3. `DemandDetail` passa a separar seus blocos (topo, Agora, grupos) para que janela e página usem as mesmas peças. O comportamento da janela não muda.
4. `useDemandState`: as alterações saem do `useState` e vão para `useStoredState` (chave nova `trilhajp3-alteracoes`). Mesmo formato de hoje; o `shortcut:` continua e sai na T5.
5. Endereço: ao abrir, `window.history.pushState` para `/demandas/{id}`. Ao fechar, `history.back()`. Evento `popstate` fecha ou reabre a janela. Segundo a documentação do Next 16 (`01-getting-started/04-linking-and-navigating.md`, "Native History API"), `pushState` não recarrega a página e sincroniza `usePathname`.
6. Contratos sem mudança: dados de demonstração, captura rápida, visões de Demandas.

## 5. Testes e critérios de aceitação

Ordem Red-Green-Refactor. Unitários (Vitest):

1. `useDemandState` guarda e relê alterações; armazenamento bloqueado cai para memória.
2. `DemandPage`: topo, três grupos, Agora e "Concluir passo"; id desconhecido mostra a mensagem.
3. `DemandDialog`: link "Abrir em página inteira" aponta para `/demandas/{id}`.

E2E (Playwright):

1. Abrir janela muda o endereço; Voltar fecha; Avançar reabre; foco volta a quem abriu.
2. Concluir um passo na janela, recarregar em `/demandas/d1`: o passo continua concluído.
3. `/demandas/d1` direto: página inteira, 3 colunas em 1440px, 2 em 820px, 1 em 320px, sem rolagem horizontal.
4. Captura rápida, depois abrir a nova demanda em página inteira.
5. axe sem crítico ou sério na página nova, claro e escuro.

Pronto quando: format, lint, typecheck, `check:task`, build e E2E verdes com log; revisão final do `impeccable` e `DESIGN.md` atualizado; revisão em 5 eixos.

## 6. Fora do escopo

Escrever comentários (T9), anexar arquivos (T11), editar título, subtarefas ou prioridade, dados no Supabase (T5).

## 7. Riscos e recuperação

1. **`pushState` e o roteador do Next.** Se o Next renderizar a rota `[id]` ao trocar o endereço, a janela some atrás da página. Prova na fatia 2, antes de seguir. Alternativa: rotas interceptadas com rota paralela (`@modal`), padrão oficial para janelas, com mais código.
2. **`cacheComponents` com rota dinâmica.** Id fora de `generateStaticParams` pode exigir `Suspense`. Coberto pelo E2E da captura rápida.
3. **Estado salvo antigo.** Formato inválido no navegador cai para os dados de demonstração (mesmo `sanitize` de hoje).
4. Recuperação: cada fatia é um commit; reverter o commit desfaz a fatia.

## 8. Fatias (cada uma com teste antes e commit próprio)

1. Estado salvo no navegador (`useDemandState`). Cerca de 30 min.
2. Endereço na janela (`pushState`, Voltar, Avançar) e prova do risco 1. Cerca de 45 min.
3. Rota `/demandas/[id]` com três colunas e responsivo. Cerca de 60 min.
4. Link "Abrir em página inteira", "Copiar link", Foco/Completo, id desconhecido. Cerca de 30 min.
5. axe, revisão final do `impeccable`, `DESIGN.md`, STATUS. Cerca de 30 min.

Total estimado: cerca de 3h15 de trabalho meu.
