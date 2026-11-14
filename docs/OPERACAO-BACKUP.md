# Backup e restauração do banco

Atualizado em 2026-11-13 (T13: anexos e arquivos órfãos). Fontes: documentação oficial do Supabase, [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) e [`supabase db dump`](https://supabase.com/docs/reference/cli/supabase-db-dump), lidas em 2026-10-27, e [Download Objects](https://supabase.com/docs/guides/storage/management/download-objects), lida em 2026-11-11: os arquivos do Storage ficam fora do dump do banco.

## Por que existe

O Supabase Free não faz backup automático (ADR 0001). Até a migração para o Pro, o único backup é o manual descrito aqui. Depois do Pro, o backup diário do Supabase (7 dias) passa a valer, e este procedimento continua como cópia mensal fora do Supabase.

## Onde roda

No computador do Pedro, não no ambiente de nuvem: a conexão direta ao Postgres não funciona lá (`tasks/t2-spec.md`, seção 2, item 4).

Precisa de:

1. Supabase CLI (`npx supabase` serve).
2. Docker Desktop ligado: a CLI roda o `pg_dump` dentro de um contêiner.
3. `psql`, só para restaurar.
4. A string de conexão do **Session pooler** (painel do projeto, botão **Connect**) com a senha do banco. A senha fica no gerenciador de senhas, nunca no repositório nem em arquivo `.env` versionado.

## Fazer o backup

Cerca de 5 minutos. Rode numa pasta **fora do repositório**:

```bash
export DB_URL='postgresql://postgres.[REF]:[SENHA]@[HOST].pooler.supabase.com:5432/postgres'
pasta="backup-$(date +%Y-%m-%d)" && mkdir "$pasta" && cd "$pasta"
npx supabase db dump --db-url "$DB_URL" -f roles.sql --role-only
npx supabase db dump --db-url "$DB_URL" -f schema.sql
npx supabase db dump --db-url "$DB_URL" -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
unset DB_URL
```

Os três arquivos têm dados pessoais (inclusive `auth.users`). Guarde a pasta compactada num lugar com 2FA (o Google Drive da empresa) e apague a cópia local.

O que **não** entra no dump: arquivos do Storage (anexos), chaves de API e configurações de Auth. Os anexos têm o passo próprio abaixo.

## Fazer o backup dos anexos

Cerca de 5 minutos, mais o tempo de download. Rode **no repositório**, com a pasta de destino **fora dele** (o script recusa uma pasta dentro do repositório). Use a mesma data do backup do banco:

```bash
export NEXT_PUBLIC_SUPABASE_URL='https://[REF].supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='[chave de serviço do painel, Project Settings > API Keys]'
npm run storage:backup -- "../backup-$(date +%Y-%m-%d)/anexos"
unset SUPABASE_SERVICE_ROLE_KEY
```

O script:

1. baixa cada arquivo do bucket `attachments` para a pasta, nos mesmos caminhos (`{empresa}/{demanda}/{arquivo}`);
2. grava `manifest.json` com o caminho, o tamanho e o tipo de cada arquivo;
3. confere que a contagem e o total de bytes batem com o Storage, e falha se não baterem.

A chave de serviço passa por cima da RLS: fica só na sessão do terminal, nunca em arquivo. Os anexos têm dados da empresa; guarde junto com o backup do banco, no mesmo lugar com 2FA.

## Restaurar (e o teste de restauração)

Cerca de 15 minutos. Nunca restaure por cima do projeto em uso: crie um projeto novo no Supabase e restaure nele.

1. Crie um projeto novo no painel do Supabase.
2. Pegue a string do Session pooler desse projeto novo.
3. Rode, na pasta do backup:

```bash
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "$NOVO_DB_URL"
```

4. Confira: `\dt public.*` lista as tabelas do app (entre elas `organizations`, `tasks` e `attachments`), e `select count(*) from auth.users;` bate com o projeto original.
5. Anexos: com as variáveis apontando para o **projeto novo**, rode na raiz do repositório:

```bash
export NEXT_PUBLIC_SUPABASE_URL='https://[REF-NOVO].supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='[chave de serviço do projeto novo]'
npm run storage:restore -- "../backup-AAAA-MM-DD/anexos"
unset SUPABASE_SERVICE_ROLE_KEY
```

   O bucket precisa existir no projeto novo: ele vem do `schema.sql` e do `data.sql` (migração `20261111120000_attachments`). Se a restauração disser que o bucket não existe, rode a migração do bucket nesse projeto e repita. O script sobrescreve o arquivo de mesmo caminho, porque o `data.sql` pode já trazer o registro dele: nunca rode a restauração apontando para o projeto em uso.
6. Confira os anexos: `select count(*) from public.attachments;` no projeto novo bate com o número de arquivos que o `storage:restore` mostrou; abra uma demanda com anexo no app apontado para o projeto novo e baixe 1 arquivo.
7. Teste terminado: apague o projeto novo no painel.

Erros conhecidos e a correção de cada um estão na seção "Troubleshooting notes" da página oficial (por exemplo, `permission denied to grant role "postgres"`).

## Frequência

| Situação | Backup manual |
| --- | --- |
| Supabase Free, só dados de teste | Antes de cada migração em `supabase/migrations/` |
| Supabase Free, com dado real | Não acontece: o ADR 0001 exige o Pro antes de dado real |
| Supabase Pro | 1 vez por mês, mais o backup diário automático |

O teste de restauração roda pelo menos 1 vez antes de entrar dado real, e depois a cada 3 meses. Ele cobre o banco **e** os anexos.

| Teste de restauração | Data | Resultado |
| --- | --- | --- |
| Banco e anexos (T13) | pendente | O Pedro roda no computador dele: a conexão direta ao Postgres não funciona no ambiente de nuvem. O caminho de backup e restauração dos anexos foi testado contra o Storage de teste em `supabase/tests/storage-scripts.test.ts`. |

## Arquivos órfãos do Storage

Um envio que termina sem gravar o registro, ou uma demanda apagada na manutenção, deixa o arquivo no Storage sem linha em `attachments`. Isso gasta a cota de 1 GB do plano gratuito. Rode 1 vez por mês, junto com o backup:

```bash
export NEXT_PUBLIC_SUPABASE_URL='https://[REF].supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='[chave de serviço]'
npm run storage:orphans              # só lista
npm run storage:orphans -- --apply   # lista e pede que você digite "apagar"
unset SUPABASE_SERVICE_ROLE_KEY
```

Só entra na lista o arquivo sem registro criado há mais de 24 horas: um envio em andamento não é apagado. Com `--apply`, nada sai sem você digitar `apagar`, e a remoção é **definitiva**. Faça o backup dos anexos antes.
