# T9: comentários

Status: **aprovada pelo Pedro em 2026-11-03 ("De acordo").** Decisões do Pedro em 2026-11-03: escrever e apagar o próprio comentário (sem editar); texto puro com quebras de linha e links clicáveis; comentários na janela e na página da demanda. Tarefa 🎨: a tela passa por 3 propostas do `impeccable` em HTML. Base: `docs/SPEC.md` (seção 5, item 5: conteúdo sempre escapado; seção 6, linha T9), ADR 0003, ADR 0007, `CONSTRAINTS.md`.

## 1. Objetivo

O Pedro registra o andamento de uma demanda em comentários: o que combinou com o cliente, o que falta, o link de um documento. Cada comentário mostra quem escreveu e quando. Só membros da empresa leem e escrevem, e o texto nunca vira código na tela.

## 2. Requisitos funcionais

1. **Escrever:** na janela (grupo "Comentários") e na coluna Comentários da página inteira, um campo de várias linhas com o botão "Comentar". Texto de 1 a 5.000 caracteres. Enter quebra a linha; Ctrl+Enter (Cmd+Enter no Mac) publica.
2. **Lista:** do mais antigo ao mais novo. Cada comentário mostra o autor, a data e a hora ("hoje, 15h", "30 de out., 9h"), em IBM Plex Mono, e o texto com as quebras de linha que foram digitadas. Endereços `http://` e `https://` viram links que abrem em outra aba, com `rel="noopener noreferrer"`.
3. **Autor:** é a parte do e-mail antes do @ de quem escreveu, gravada pelo banco no momento do comentário (o cliente não envia o autor). O próprio comentário diz "Você".
4. **Apagar:** só o autor apaga o próprio comentário, com confirmação ("Apagar este comentário?"). Apagar arquiva o comentário (`archived_at`), e ele some da lista e da contagem. Sem desfazer nesta tarefa.
5. **Escapado:** o texto é sempre mostrado como texto. Nenhum HTML do comentário é interpretado, e só o padrão de link vira `<a>`.
6. **Erros:** se a gravação falhar, o texto continua no campo e aparece o aviso "Não foi possível salvar. Tente de novo."
7. **Só demandas:** subtarefas não têm comentários.

## 3. Requisitos não funcionais

1. **Segurança:**
   - tabela `task_comments` com RLS por empresa, como as anteriores;
   - insert só com `task_id`, `organization_id` e `body`; o autor (`created_by`) e o nome (`author_name`) vêm de padrões do banco ligados à sessão;
   - nada se altera depois de publicado, exceto `archived_at`, e só pelo autor (política de update com `created_by = auth.uid()`);
   - sem `dangerouslySetInnerHTML`;
   - teste com `<script>`, `<img onerror>` e `javascript:` no texto.
2. **Acessibilidade:** campo com rótulo, botão com nome, lista como `<ol>`, aviso em região viva, foco no campo depois de publicar. Axe nos dois temas.
3. **Marca:** tokens `--mc-*`, ícones do componente `Icon`, nenhum laranja novo.
4. **Dependências:** nenhuma nova.

## 4. Banco e contratos

1. Migração nova, reversível, com rollback. A tabela `task_comments` tem:
   - `id`, `organization_id` e `task_id`, com chave composta para a demanda ser da mesma empresa;
   - `body`: de 1 a 5.000 caracteres;
   - `created_by`: padrão `auth.uid()`;
   - `author_name`: padrão a parte antes do @ de `auth.jwt() ->> 'email'`;
   - `created_at` e `archived_at`.

   Um gatilho recusa comentário em subtarefa.

2. Server Actions, no padrão das existentes (devolvem `true` ou `false`, com validação `zod`): `addComment(taskId, body)` e `archiveComment(commentId)`.
3. A leitura das demandas passa a trazer os comentários ativos de cada uma, já no formato da tela, com um `mine` que diz se o comentário é de quem está logado.

## 5. Design (3 propostas, `impeccable`)

O `impeccable` traz 3 propostas em HTML, nos dois temas, para a lista e o campo de comentário na janela e na página. Elas decidem:

- se o campo fica antes ou depois da lista;
- como aparecem o autor e a data;
- onde fica "Apagar".

Só depois da escolha do Pedro a tela é construída.

## 6. Fora do escopo

Editar comentário, desfazer a remoção, menções, formatação (negrito, listas), anexos no comentário, notificações, reações, comentários em subtarefa e comentários na tabela, nos cartões e na Retomar.

## 7. Testes e critérios de aceitação

1. **Banco (`npm run test:db`):**
   - autor e nome vêm da sessão, mesmo que o cliente tente enviar outros;
   - texto vazio ou com mais de 5.000 caracteres é recusado;
   - comentário em subtarefa é recusado;
   - um membro não apaga o comentário de outro;
   - membro de outra empresa não lê nem escreve.
2. **Unitários:**
   - as ações validam a entrada;
   - o texto com `<script>`, `<img onerror=…>` e um link `javascript:` aparece como texto, e só `https://` vira link;
   - as quebras de linha se mantêm;
   - a tela volta ao estado anterior quando a gravação falha.
3. **E2E:** escrever, ver depois de recarregar e apagar, na janela e na página; Ctrl+Enter publica. Axe nos dois temas.
4. **Checagens:** todas as do `CONSTRAINTS.md`, mais o revisor final do `impeccable`.

## 8. Fatias

1. Migração, RLS e testes de banco. Cerca de 45 min (estimativa).
2. Server Actions e leitura dos comentários, com testes unitários. Cerca de 40 min.
3. 3 propostas em HTML e escolha do Pedro. Cerca de 40 min.
4. Lista e campo na janela e na página, com E2E. Cerca de 1h10.
5. Revisão final do `impeccable`, `DESIGN.md`, `docs/STATUS.md` e PR. Cerca de 25 min.

Total estimado: cerca de 3h40.

## 9. Riscos

1. **Nome do autor sem e-mail:** se a sessão não tiver e-mail, o nome fica "Membro". Hoje todo usuário entra por e-mail e senha, então não acontece.
2. **Link malicioso:** só `http://` e `https://` viram link. O `rel="noopener noreferrer"` impede que a página aberta controle o app.
