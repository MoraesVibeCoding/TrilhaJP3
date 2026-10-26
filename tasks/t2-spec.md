# T2: Esquema inicial e RLS (empresas e vínculos)

Status: **rascunho, aguardando aprovação do Pedro.** Nenhum código nem SQL foi aplicado ao banco. Base: `docs/SPEC.md` (seções 4.2, 4.3 e 4.5), ADR 0003, `CONSTRAINTS.md`.

## 1. Objetivo

Criar no Supabase de teste as duas primeiras tabelas (`organizations` e `memberships`) com Row Level Security, e provar com teste automatizado que um usuário de uma empresa não lê nem altera nada de outra. Esta é a base de todas as tabelas seguintes (T4 em diante): cada uma vai reaproveitar a mesma função de acesso e o mesmo modelo de teste.

## 2. Fatos verificados em 2026-10-26

1. As 4 variáveis do Supabase chegam ao ambiente de nuvem e respondem (`docs/STATUS.md`, Pendências, item 1).
2. O banco de teste está vazio: nenhuma tabela em `public`, nenhum usuário em `auth.users`.
3. O token de acesso executa SQL como `postgres` pela Management API (`POST https://api.supabase.com/v1/projects/{ref}/database/query`, resposta 201).
4. A conexão direta ao Postgres não funciona no ambiente de nuvem: o DNS de `db.{ref}.supabase.co` (porta 5432) e do pooler (6543) falha. O ambiente também não tem Docker.
5. Pela referência oficial da CLI, `supabase db push` precisa do projeto ligado (`supabase link`, com a senha do banco) ou de `--db-url`, e conecta ao Postgres. `supabase test db` roda o `pg_prove` num contêiner. **Nenhum dos dois roda aqui** (itens 4).
6. `supabase.com` está bloqueado pela rede do ambiente. A documentação foi lida pela fonte oficial no GitHub (`supabase/supabase`, `apps/docs/content/guides/database/postgres/row-level-security.mdx` e `apps/docs/spec/cli_v1_commands.yaml`).

## 3. Requisitos funcionais

1. Tabela `public.organizations`: `id uuid` (padrão `gen_random_uuid()`), `name text` não vazio, `created_at timestamptz` (padrão `now()`).
2. Tabela `public.memberships`: `organization_id` (FK para `organizations`, `on delete cascade`), `user_id` (FK para `auth.users`, `on delete cascade`), `role text` restrito a `owner` ou `member`, `created_at timestamptz`. Chave primária `(organization_id, user_id)`. Índice em `user_id`.
3. Função `private.is_member(org uuid) returns boolean`: verdadeira quando existe vínculo de `auth.uid()` com `org`. `security definer`, `set search_path = ''`, nomes qualificados, `stable`. Fica no esquema `private`, que **não** é exposto pela API (a documentação proíbe função `security definer` em esquema exposto). `execute` só para `authenticated`.
4. RLS ligada nas duas tabelas. `revoke all` de `anon` e `authenticated`; depois `grant select` só para `authenticated`.
5. Políticas, só leitura, `to authenticated`:
   - `organizations`: lê a empresa quando `private.is_member(id)`.
   - `memberships`: lê os vínculos da empresa quando `private.is_member(organization_id)`.
6. Na v1, o navegador não cria, altera nem apaga empresas e vínculos (cadastro de empresas está fora da v1, `docs/SPEC.md` seção 5). Isso fica com migrações e com a chave de serviço no servidor. A empresa Moraes CodeVibe e o vínculo do Pedro entram na T3, quando o usuário dele existir.

Regras seguidas da documentação oficial: `(select auth.uid())` em vez de `auth.uid()` (avaliado uma vez por consulta); `to authenticated` em toda política; grants e RLS na mesma migração; `security definer` com `search_path` vazio.

## 4. Migrações

1. Arquivos SQL versionados em `supabase/migrations/<timestamp>_<nome>.sql`, o formato da CLI. Assim, quando houver conexão direta (computador do Pedro ou CI), a CLI continua servindo.
2. Cada migração tem um arquivo de reversão ao lado, `supabase/rollbacks/<timestamp>_<nome>.sql` (a CLI não tem "down"). A reversão da T2 apaga as duas tabelas, a função e o esquema `private`. Só se aplica com o banco ainda sem dado real.
3. **Como aplicar (decisão aberta 1):** ver seção 8.

## 5. Testes e critérios de aceitação

Testes de integração em Vitest, contra o Supabase de teste, pela API pública (PostgREST e Auth, com `@supabase/supabase-js`): o mesmo caminho que o navegador vai usar. Isso testa grants e políticas juntos, que é o que importa. Ficam em `supabase/tests/`, com configuração própria (`vitest.db.config.mts`) e o comando `npm run test:db`. O `npm test` não roda esses testes porque eles precisam de rede e de segredos.

Preparação (chave de serviço, só no teste): 2 usuários fictícios (`t2-a@example.test`, `t2-b@example.test`), empresas A e B, cada usuário vinculado à sua. Login real por senha, para obter o token de cada usuário. No fim, os usuários e as empresas são apagados (os vínculos saem em cascata), mesmo se um teste falhar.

Critérios (cada um é um teste):

1. A lê a própria empresa e os vínculos dela; **não** vê a empresa B nem os vínculos de B.
2. A não cria empresa, não cria vínculo (nem em A, nem em B), não altera nem apaga empresa ou vínculo. Erro `42501` ou nenhuma linha afetada; o teste confere que o banco não mudou.
3. Sem login (só a chave pública), as duas tabelas negam acesso.
4. `private.is_member` não é chamável pela API (`/rest/v1/rpc/is_member` não existe).
5. Um usuário sem vínculo nenhum lê zero linhas.
6. A reversão aplicada num banco de teste remove tudo, e a migração aplicada de novo deixa os testes verdes.
7. Todas as checagens do `CONSTRAINTS.md` verdes (`npm run check:task` e o CI). O código de teste novo não entra na cobertura de `src/`.

Antes de fechar: protocolo `doubt-driven-development` (tarefa de alto risco, `tasks/plan.md` regra 4) e revisão em 5 eixos.

## 6. Fora do escopo

Login e sessão no app (`@supabase/ssr`, T3), dados reais da empresa, tabelas de projetos e demandas (T4 e T5), Storage (T11), gatilhos de histórico (T10), cadastro de empresas e convites.

## 7. Riscos

1. **Testes contra banco remoto compartilhado:** dois testes rodando ao mesmo tempo (local e CI) se atrapalham. Mitigação: e-mails e nomes de empresa com um sufixo aleatório por execução.
2. **Projeto gratuito pausa com pouca atividade** (D2): o teste falha com erro de rede. A mensagem do teste diz para conferir se o projeto está pausado.
3. **Função `security definer` mal escrita vaza dados:** `search_path` vazio, esquema não exposto, teste do critério 4.
4. **Grants padrão:** tabela nova em `public` nasce com tudo liberado para `anon` e `authenticated`. O `revoke all` vem antes de qualquer `grant`, e o critério 2 prova o resultado.

## 8. Decisões abertas (uma de cada vez)

1. **Como aplicar migrações. Decidido pelo Pedro em 2026-10-26: script pela Management API.** Um script curto (`scripts/db-migrate.mjs`, sem dependência nova) que envia cada arquivo de `supabase/migrations/` pela Management API e registra a versão na mesma tabela de histórico da CLI (`supabase_migrations.schema_migrations`). As colunas exatas dessa tabela serão conferidas no banco antes de escrever. Alternativa: instalar a CLI e rodar `supabase db push` do computador do Pedro, com a senha do banco. Essa alternativa não roda na nuvem.
2. **Testes de integração no CI. Decidido pelo Pedro em 2026-10-26: sim; ele cadastra os 3 segredos.** Para rodar no GitHub Actions, o Pedro cadastra 3 segredos no repositório: URL, chave pública e chave de serviço. O token de acesso não entra no CI. Sem eles, `npm run test:db` roda só na sessão de nuvem, e o registro fica no log da tarefa.
3. **Cliente nos testes. Decidido pelo Pedro em 2026-10-26: `@supabase/supabase-js`,** instalado na versão fixa 2.118.0 (licença MIT, `npm audit` sem achados). Os testes usam o mesmo cliente que a T3 vai usar no app.

## 9. Tarefas depois da aprovação

1. Teste de integração vermelho (critérios 1 a 5) contra o banco vazio.
2. Migração SQL e reversão; aplicar; testes verdes.
3. Script de migração (se a decisão 1 for a recomendada) com teste unitário.
4. Critério 6 (reverter e reaplicar).
5. `doubt-driven-development`, revisão em 5 eixos, `npm run check:full`, atualização de `docs/STATUS.md` e do ADR 0003.
