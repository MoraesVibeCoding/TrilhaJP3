# ADR 0003: Multiempresa por `organization_id` com RLS em todas as tabelas

## Status
Aceita. Implementada na T2 (2026-10-26) para `organizations` e `memberships`; as próximas tabelas seguem o mesmo modelo.

## Data
2026-10-21

## Contexto
O sistema será de uma empresa na v1 (Moraes CodeVibe), com possibilidade de venda a outras no futuro. Adaptar um banco de empresa única para várias empresas depois seria caro. A `docs/SPEC.md` define o modelo.

## Decisão
- Toda tabela de negócio tem `organization_id`. IDs em UUID; datas em `timestamptz`.
- **Row Level Security ligada em todas as tabelas e no Storage.** Acesso negado por padrão, com políticas explícitas por empresa.
- Uma função `private.is_member(organization_id)` centraliza a regra. Fica no esquema `private`, fora da API, porque é `security definer`.
- Só a chave pública do Supabase vai ao navegador; a chave de serviço fica no servidor. Segredos nunca vão ao repositório.
- Anexos ficam em `{organization_id}/{task_id}/{uuid}-{nome}`.

## Alternativas consideradas
- **Banco de empresa única, multiempresa depois:** rejeitada na SPEC (objetivo 5: os dados nascem organizados por empresa).
- Outras estratégias de isolamento (esquema por empresa, banco por empresa) não foram avaliadas nas fontes.

## Consequências
- A T2 precisa de teste de integração que prove que um usuário de outra empresa não lê nem escreve nada.
- RLS e gatilhos de histórico são tarefas de alto risco: o protocolo `doubt-driven-development` roda antes de fechar a T2 e a T10.
- O token de migração do Supabase (R5) chegou em 2026-10-26; a T2 está especificada em `tasks/t2-spec.md`.
