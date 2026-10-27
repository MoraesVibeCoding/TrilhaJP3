# T4: Projetos (criar, editar, listar, arquivar)

Status: **rascunho com as decisões respondidas, aguardando aprovação do Pedro.** Nenhum código nem SQL foi escrito. Base: `docs/SPEC.md` (seções 4.2, 4.3 e 6), ADR 0003, `tasks/t2-spec.md`, `tasks/t3-spec.md`, `CONSTRAINTS.md`.

## 1. Objetivo

O Pedro cadastra os projetos reais da Moraes CodeVibe no TrilhaJp3: cria, edita, lista e arquiva, numa página Projetos. Os dados ficam no Supabase, isolados por empresa (RLS), e só quem é membro da empresa lê ou altera. É a primeira tabela de negócio e o primeiro uso de `getCurrentUser()` (T3).

## 2. Fatos de partida

1. Hoje os projetos são dados de demonstração (`src/lib/demo-data.ts`, 4 projetos fixos), usados na visão Por projeto, no Retomar, nas demandas e na captura rápida. A barra lateral mostra "Projetos em breve".
2. As demandas de demonstração apontam para os projetos de demonstração (`projectId: "p1"`). As demandas reais chegam só na T5.
3. A T2 deixou o modelo de acesso pronto: `private.is_member(org)`, RLS ligada, grants mínimos, testes de integração pela API pública.
4. A T3 deixou `getCurrentUser()` (id, e-mail e empresa), Server Actions com `zod` e o E2E com usuário fictício.

## 3. Requisitos funcionais

1. **Tabela `public.projects`** (`docs/SPEC.md` 4.2): `id uuid`, `organization_id` (FK, `on delete cascade`), `name` (1 a 120 caracteres), `description` (até 2.000, opcional), `status` (`idea` | `in_progress` | `paused` | `done`, padrão `idea`), `priority` (`high` | `medium` | `low`, padrão `medium`), `link` (opcional, só `https://`), `created_by` (padrão `auth.uid()`), `created_at`, `updated_at` (gatilho), `archived_at` (opcional). Índice em `organization_id`.
2. **RLS**, `to authenticated`, todas por `private.is_member(organization_id)`: ler, criar e alterar projetos da própria empresa. **Sem apagar**: arquivar é `archived_at` (exclusão lógica, `docs/SPEC.md` 4.2 regra 3). Na alteração, `organization_id` e `created_by` não mudam (grant de `update` só nas colunas editáveis). `anon` sem acesso.
3. **Página `/projetos`** dentro da casca; "Projetos" deixa de ser "em breve" na barra lateral. Lista os projetos ativos com nome, estado, prioridade e link; mostra quantos estão arquivados e permite vê-los e restaurá-los. 🎨 Passa pelo `impeccable` (3 propostas, escolha do Pedro, critique e auditoria antes de subir).
4. **Criar e editar** com os campos do item 1, validados com `zod` no servidor (Server Actions), mensagens de erro por campo, em pt-BR. A empresa vem de `getCurrentUser()`, nunca do formulário.
5. **Arquivar e restaurar** com confirmação curta; arquivar não apaga nada.
6. **Fora desta tarefa, por decisão abaixo:** as outras telas continuam com os dados de demonstração até a T5.

## 4. Testes e critérios de aceitação

1. **Integração (`npm run test:db`):** membro lê, cria, altera e arquiva projetos da própria empresa; não lê nem altera os da outra; não cria projeto em outra empresa; não muda `organization_id` nem `created_by`; não apaga; `anon` sem acesso; `updated_at` muda na alteração.
2. **Unitários:** esquema `zod` (limites, `https://` obrigatório no link, estados e prioridades válidos); Server Actions com o Supabase simulado (erro por campo, empresa vinda do usuário, arquivar e restaurar).
3. **E2E:** o usuário fictício do `global-setup` ganha uma empresa e um vínculo de teste (apagados no fim); cria, edita, arquiva e restaura um projeto; sem login, `/projetos` leva a `/entrar`.
4. **Acessibilidade:** `/projetos` e o formulário no `e2e/accessibility.spec.ts`, claro e escuro.
5. `CONSTRAINTS.md` verde, CI verde. Antes de subir: `impeccable` (critique e auditoria), revisão de segurança e `doubt-driven-development` (RLS é alto risco, `tasks/plan.md` regra 4).

## 5. Fora do escopo

Demandas reais (T5), ligar a visão Por projeto e o Retomar aos projetos reais (T5), apagar de vez, histórico de alterações (T10), etiquetas (T8), ordenar por arrastar.

## 6. Riscos

1. **Dois mundos na tela até a T5:** projetos reais em `/projetos`, projetos de demonstração nas outras telas. Mitigação: o aviso "Dados de demonstração" continua nas telas antigas; `/projetos` não mostra o aviso.
2. **RLS de escrita é o primeiro caso de `insert`/`update` do app:** `with check` errado deixaria gravar em outra empresa. Mitigação: testes do item 4.1 com duas empresas, revisão adversarial.
3. **Link externo:** só `https://`, aberto com `rel="noopener noreferrer"`; nada de `javascript:`.

## 7. Decisões

1. **Dados de demonstração. Decidido pelo Pedro em 2026-10-27: seguir a recomendação.** só `/projetos` usa dados reais na T4; as outras telas trocam na T5, junto com as demandas (senão as demandas de demonstração apontariam para projetos que não existem). Alternativa: trocar tudo agora e deixar as demandas vazias até a T5.
2. **Campos do formulário. Decidido pelo Pedro em 2026-10-27: seguir a recomendação.** todos os do modelo (nome, descrição, estado, prioridade, link). Alternativa: só nome e estado agora.
3. **Arquivados. Decidido pelo Pedro em 2026-10-27: seguir a recomendação.** um filtro "Arquivados (N)" na própria página, com "Restaurar". Alternativa: arquivados somem sem caminho de volta pela interface.

## 8. Tarefas depois da aprovação

1. Teste de integração vermelho; migração `projects` com RLS, grants por coluna e gatilho de `updated_at`; reversão; verde.
2. Esquema `zod` e Server Actions com testes.
3. 🎨 3 propostas da página `/projetos` via `impeccable`; escolha do Pedro.
4. Construir a página, o formulário e arquivar/restaurar; E2E e acessibilidade.
5. `impeccable` (critique e auditoria), revisão de segurança, `doubt-driven-development`, `npm run check:full`, `docs/STATUS.md`.
