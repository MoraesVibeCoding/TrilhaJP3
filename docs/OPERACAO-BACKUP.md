# Backup e restauração do banco

Atualizado em 2026-10-27. Fonte: documentação oficial do Supabase, [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) e [`supabase db dump`](https://supabase.com/docs/reference/cli/supabase-db-dump), lidas em 2026-10-27.

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

O que **não** entra no dump: arquivos do Storage (anexos), chaves de API e configurações de Auth. Hoje o app não guarda anexos; quando guardar, siga a seção "Migrating storage objects" da página oficial.

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

4. Confira: `\dt public.*` lista `organizations`, `memberships` e `projects`, e `select count(*) from auth.users;` bate com o projeto original.
5. Teste terminado: apague o projeto novo no painel.

Erros conhecidos e a correção de cada um estão na seção "Troubleshooting notes" da página oficial (por exemplo, `permission denied to grant role "postgres"`).

## Frequência

| Situação | Backup manual |
| --- | --- |
| Supabase Free, só dados de teste | Antes de cada migração em `supabase/migrations/` |
| Supabase Free, com dado real | Não acontece: o ADR 0001 exige o Pro antes de dado real |
| Supabase Pro | 1 vez por mês, mais o backup diário automático |

O teste de restauração roda pelo menos 1 vez antes de entrar dado real, e depois a cada 3 meses.
