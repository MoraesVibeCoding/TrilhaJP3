# T11: anexos

Status: **aguardando aprovação do Pedro.** Decisões do Pedro em 2026-11-11:

- só quem enviou remove o anexo, e o arquivo é apagado de vez;
- imagens aparecem com miniatura; PDFs e documentos, com ícone, nome e tamanho;
- a tela passa por 3 propostas do `impeccable` em HTML.

Base: `docs/SPEC.md` (seção 3, Anexos; seção 4, `attachments`; seção 4.2, item 4; seção 5, item 3; seção 6, linha T11), ADR 0003, `CONSTRAINTS.md`. Documentação oficial do Supabase consultada em 2026-11-11:

- [Creating Buckets, "Restricting uploads"](https://supabase.com/docs/guides/storage/buckets/creating-buckets#restricting-uploads): `allowedMimeTypes` e `fileSizeLimit` no bucket;
- [Storage Buckets, "Private buckets"](https://supabase.com/docs/guides/storage/buckets/fundamentals): acesso por RLS e link assinado;
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control): políticas em `storage.objects` com `storage.foldername(name)`;
- [Limits](https://supabase.com/docs/guides/storage/uploads/file-limits): limite global de 50 MB no plano gratuito, acima dos nossos 10 MB.

## 1. Objetivo

O Pedro anexa à demanda o que ela precisa: o print, o PDF do contrato, a planilha do cliente. Ele vê as imagens em miniatura e abre qualquer anexo em outra aba. Só membros da empresa acessam os arquivos, e nenhum arquivo perigoso entra.

## 2. Requisitos funcionais

1. **Enviar:** na janela (grupo "Anexos") e na coluna Anexos da página inteira, o Pedro escolhe um ou mais arquivos. O jeito de escolher (botão, arrastar e soltar) é decidido pelas propostas da seção 5. Cada arquivo mostra o andamento e entra na lista quando termina.
2. **Tipos aceitos:**
   - imagens: JPG, PNG, WebP, GIF e HEIC;
   - PDF;
   - documentos de escritório: Word, Excel e PowerPoint (`.docx`, `.xlsx`, `.pptx` e os antigos `.doc`, `.xls`, `.ppt`), e os do LibreOffice (`.odt`, `.ods`, `.odp`);
   - texto e CSV.

   Todo o resto é recusado, inclusive executáveis, scripts, SVG e HTML (os dois últimos podem rodar código no navegador).

3. **Tamanho:** até 10 MB por arquivo. Acima disso, o aviso aparece antes de enviar.
4. **Lista:** do mais novo ao mais antigo.
   - Imagens mostram uma miniatura.
   - PDFs e documentos mostram o ícone do tipo.
   - Todos mostram nome, tamanho (em mono, por exemplo "2,4 MB"), quem enviou ("Você" nos seus) e quando.
5. **Abrir:** clicar abre o arquivo em outra aba, por um link assinado que vale 5 minutos. Imagens e PDF abrem no navegador; documentos são baixados.
6. **Remover:** só quem enviou, com confirmação ("Remover este anexo?"). O registro e o arquivo são apagados de vez.
7. **Histórico:** enviar e remover entram no histórico da T10 ("Anexou contrato.pdf", "Removeu o anexo contrato.pdf").
8. **Erros:** tipo ou tamanho recusado, ou falha de envio, mostram um aviso claro. O arquivo que falhou não entra na lista.
9. **Só demandas:** subtarefas não têm anexos.

## 3. Requisitos não funcionais

1. **Segurança:**
   - bucket `attachments` **privado**, com `file_size_limit` de 10 MB e `allowed_mime_types` com a lista da seção 2;
   - RLS em `storage.objects` para o bucket: o membro da empresa lê e envia só dentro de `{organization_id}/…` da própria empresa, e só o dono do objeto apaga;
   - a tabela `attachments` tem RLS por empresa: leitura para membros, insert do próprio usuário e delete só por quem enviou;
   - o banco não confia no que o navegador diz. Um gatilho no insert de `attachments` confere:
     - que o arquivo existe no Storage, no caminho `{organization_id}/{task_id}/…` da própria linha;
     - que o tamanho e o tipo gravados são os do objeto no Storage (`metadata`);
     - que a extensão do nome está na lista;
   - o caminho tem um `uuid`, e o nome original fica só na coluna `file_name`, então ninguém escolhe o caminho de outro arquivo.
2. **Envio:** direto do navegador para o Storage, com a sessão do usuário (o RLS decide). Depois, uma Server Action grava a linha. O arquivo não passa pelo servidor do app, que tem limite de corpo de 1 MB nas Server Actions.
3. **Acessibilidade:** botão com nome, lista como `<ol>`, miniaturas com `alt` (o nome do arquivo), andamento e erros em região viva. Axe nos dois temas.
4. **Marca:** tokens `--mc-*`, tamanho em IBM Plex Mono, ícones do componente `Icon` (pode faltar um ícone de documento, que eu desenho no traço da marca).
5. **Dependências:** nenhuma nova.

## 4. Banco e contratos

1. **Migração nova, reversível, com rollback.**
   - Cria o bucket `attachments` com os limites e as políticas em `storage.objects`.
   - Cria a tabela `attachments`: `id`, `organization_id`, `task_id`, `storage_path` (único), `file_name`, `mime_type`, `size_bytes`, `uploaded_by` (padrão `auth.uid()`, `on delete set null`), `uploader_name` (como nos comentários) e `created_at`.
   - A chave composta garante que a demanda é da mesma empresa, com `on delete cascade`.
   - Gatilhos: recusa subtarefa, confere o objeto no Storage (seção 3.1) e grava os eventos `attachment_added` e `attachment_removed` no histórico (`task_events` ganha os 2 tipos).
2. **Apagar a demanda:** as linhas de `attachments` saem em cascata. Os arquivos no Storage não saem sozinhos. O app só arquiva demandas, então isso só acontece na manutenção; a limpeza fica registrada como risco.
3. **Server Actions,** no padrão das existentes, devolvendo `true` ou `false`, com validação `zod`:
   - `addAttachment(taskId, storagePath, fileName)`, depois do envio;
   - `removeAttachment(attachmentId)`, que apaga a linha e o objeto.
4. **Leitura:** `listDemands` traz os anexos de cada demanda, com `mine`. O link assinado é pedido ao abrir, por uma Server Action (`attachmentUrl(id)`), para não gerar links para todos os anexos a cada carga. As miniaturas também usam link assinado, pedido em lote por demanda aberta.

## 5. Design (3 propostas, `impeccable`)

O `impeccable` traz 3 propostas em HTML, nos dois temas, para enviar (botão, arrastar e soltar, andamento) e para a lista (miniaturas, ícones, remover com confirmação) na janela e na página. Só depois da escolha do Pedro a tela é construída.

## 6. Fora do escopo

- Pré-visualização embutida (visualizador de PDF ou galeria).
- Renomear anexos.
- Versões de um mesmo arquivo.
- Anexos em comentários.
- Antivírus.
- Anexos em subtarefas, na tabela, nos cartões e na Retomar.
- Limpeza automática de arquivos órfãos.

## 7. Testes e critérios de aceitação

1. **Banco e Storage (`npm run test:db`):**
   - tipo fora da lista e arquivo acima de 10 MB são recusados pelo bucket;
   - extensão proibida (`.exe`, `.svg`, `.html`) é recusada pelo gatilho, mesmo com tipo aceito;
   - membro de outra empresa não lê, não envia e não apaga arquivo nem linha;
   - a linha só entra se o arquivo existe no caminho da própria empresa e demanda;
   - o tamanho e o tipo vêm do Storage, não do cliente;
   - só quem enviou apaga;
   - anexo em subtarefa é recusado;
   - enviar e remover geram eventos no histórico.
2. **Unitários:**
   - validação de tipo, extensão e tamanho no navegador;
   - formatação do tamanho ("2,4 MB");
   - as ações validam a entrada;
   - a tela volta ao estado anterior quando a gravação falha.
3. **E2E:**
   - enviar uma imagem e um PDF, ver a miniatura e o ícone, recarregar e ainda ver;
   - abrir em outra aba;
   - remover;
   - ver o aviso com um arquivo recusado;
   - axe nos dois temas.
4. **Checagens:** todas as do `CONSTRAINTS.md`, mais o revisor final do `impeccable`.

## 8. Fatias

1. Bucket, tabela, políticas, gatilhos e testes de banco. Cerca de 1h20 (estimativa).
2. Server Actions, leitura e validações, com testes unitários. Cerca de 50 min.
3. 3 propostas em HTML e escolha do Pedro. Cerca de 40 min.
4. Enviar, lista e remover na janela e na página, com E2E. Cerca de 1h20.
5. Revisão final do `impeccable`, `DESIGN.md`, `docs/STATUS.md` e PR. Cerca de 25 min.

Total estimado: cerca de 4h35.

## 9. Riscos

1. **Tipo declarado pelo navegador:** o `allowedMimeTypes` do bucket confia no tipo que o navegador envia. A extensão conferida no gatilho e o download forçado de documentos reduzem o risco, mas um arquivo com tipo falso ainda pode ser guardado. Sem antivírus, que está fora do escopo.
2. **Arquivos órfãos:** um envio que termina sem gravar a linha, ou uma demanda apagada na manutenção, deixa o arquivo no Storage. Isso é aceitável no volume de uma pessoa; a limpeza entra na T13.
3. **Plano gratuito:** 1 GB de Storage no total. O uso cabe por muito tempo, mas vale acompanhar na T13.
4. **HEIC:** o navegador pode não mostrar a miniatura de fotos HEIC de iPhone. Nesse caso aparece o ícone de imagem, e o arquivo abre normalmente.
