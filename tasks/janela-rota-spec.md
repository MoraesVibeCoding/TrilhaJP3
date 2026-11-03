# Conserto: a janela da demanda não pode virar página inteira depois de gravar

Status: **aguardando aprovação do Pedro.** Pedido do Pedro em 2026-11-03: consertar antes da T9, em tarefa e PR separadas. Base: `tasks/t5b-spec.md` (requisito 4 e risco 1), `CONSTRAINTS.md`.

## 1. Problema

Na `main`, desde a T5b, gravar qualquer coisa na janela da demanda (concluir passo, subtarefa, etiqueta e, na T9, comentário) troca a janela pela página inteira da demanda, um instante depois de salvar.

Causa, reproduzida num app Next 16.4.2 mínimo (mesma versão do projeto):

1. A janela troca o endereço para `/demandas/{id}` com `window.history.pushState`. O roteador do Next passa a considerar esse o endereço atual.
2. Toda Server Action chama `revalidatePath("/", "layout")`. O Next então busca de novo a rota do endereço atual, que é a página inteira (`/demandas/[id]`), e ela substitui Retomar ou Demandas, com a janela junto.

Os E2E atuais não pegam o defeito, porque conferem a janela logo depois de gravar, antes de a página trocar. O E2E novo da T9 (Esc na confirmação de apagar um comentário) pegou.

Este é o risco 1 da T5b. Ele foi dado como provado na fatia 2 da T5b, mas só para abrir a janela, não para gravar.

## 2. Objetivo

Gravar na janela mantém a janela aberta e a lista embaixo, com os dados atualizados. Tudo o que a T5b decidiu continua valendo:

- endereço `/demandas/{id}` com a janela aberta;
- Voltar fecha e Avançar reabre;
- recarregar ou abrir o link mostra a página inteira;
- o foco volta para quem abriu a janela.

## 3. Solução (provada na reprodução)

Padrão do Next para janelas: rota paralela com rota interceptada. Fonte: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/intercepting-routes.md` (seção "Modals") e `parallel-routes.md` (seção `default.js`).

1. `src/app/(app)/@modal/(.)demandas/[id]/page.tsx` devolve `null`: na navegação dentro do app, a rota `/demandas/[id]` é interceptada e Retomar ou Demandas continua na tela.
2. `src/app/(app)/@modal/default.tsx` devolve `null`: sem ele, carregar qualquer outra rota daria 404.
3. `src/app/(app)/layout.tsx` recebe o espaço `modal` e o põe depois de `children`.
4. `useOpenDemand` abre com `router.push(demandPath(id), { scroll: false })` em vez de `pushState`. O `pushState` não passa pela interceptação: com ele, a rota vazia não resolve (também testado).
5. A janela continua onde está: dentro de Retomar e de Demandas, com o mesmo estado otimista. Nada muda nos componentes da janela.

Resultado na reprodução, partindo de `/` e de `/demandas`:

- depois da Server Action, a lista e a janela continuam, e os dados da lista se atualizam;
- Voltar fecha, Avançar reabre e recarregar mostra a página inteira.

**Risco de atraso:** o `router.push` só troca o endereço depois de buscar a rota no servidor. Para a janela não abrir atrasada, `useOpenDemand` marca o id aberto na hora (estado local) e o endereço vem logo depois. Esse é o mesmo motivo do comentário atual, que lê o endereço do navegador, e não o `usePathname`.

## 4. Fora do escopo

- Mover o conteúdo da janela para a rota `@modal`, com busca própria no servidor.
- Mudar a página inteira.
- Mudar as Server Actions.

## 5. Testes e critérios de aceitação

1. **Unitário (`demand-url.test.ts`):**
   - abrir marca o id na hora e chama `router.push` com `/demandas/{id}`;
   - fechar volta;
   - fechar duas vezes não volta duas páginas.
2. **E2E novo, que falha hoje** (RED antes do conserto, no CI):
   - concluir um passo na janela, em Retomar e em Demandas;
   - esperar a gravação e a atualização (o passo novo vindo do banco);
   - conferir que a janela e a lista continuam e que o endereço é `/demandas/{id}`.
3. **E2E atuais de endereço da janela (`demand-page.spec.ts`)** passam sem mudança: Voltar, Avançar, Esc com foco de volta e "Abrir em página inteira".
4. **Checagens:** todas as do `CONSTRAINTS.md`, mais o axe da janela nos dois temas.

## 6. Fatias

1. Teste E2E que reproduz o defeito, mais o push para ver o vermelho no CI. Cerca de 20 min, mais uns 10 de CI (estimativa).
2. Rota interceptada, espaço no layout, `useOpenDemand` com `router.push` e testes unitários. Cerca de 40 min.
3. CI verde, `docs/STATUS.md` e PR. Cerca de 20 min.

Total estimado: cerca de 1h30.

Depois do merge, a branch da T9 recebe a `main` e o E2E do Esc roda de novo, sem mudança.

## 7. Riscos

1. **Prefetch:** o `Link` e o `router.push` podem pré-carregar a rota interceptada. Ela devolve `null`, então custa só uma ida ao servidor por demanda aberta.
2. **Telas sem o espaço `modal`:** `/entrar` fica fora do grupo `(app)` e não abre a janela. Nada muda nessa tela.
3. **Desfazer:** a mudança é reversível. Basta apagar os 2 arquivos novos e voltar `useOpenDemand` e o layout.
