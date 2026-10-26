# ADR 0001: Desenvolver nos planos gratuitos e migrar para Vercel Pro e Supabase Pro antes de dado real

## Status
Aceita (D1 e D2 da `docs/SPEC.md`, aprovadas pelo Pedro em 2026-10-21).

## Data
2026-10-21

## Contexto
A premissa inicial era que planos gratuitos bastavam. A verificação na documentação oficial (registrada na `docs/SPEC.md`, seção 3) mostrou o contrário: o plano Hobby da Vercel é limitado a uso pessoal e não comercial, e a Vercel pode desativar projetos Hobby com ou sem aviso. O Supabase Free tem 500 MB de banco, 1 GB de arquivos, **sem backups automáticos**, e pausa projetos com pouca atividade na semana. O Pro (a partir de US$ 25 por mês segundo a SPEC, a conferir na contratação) não pausa e guarda backups diários por 7 dias.

## Decisão
Desenvolver nos planos gratuitos. **Migrar para Vercel Pro e Supabase Pro antes de entrar qualquer dado real da empresa.** Nada da Moraes CodeVibe entra no sistema antes disso.

## Alternativas consideradas
- **Ficar no Vercel Hobby:** rejeitada, uso comercial não é permitido.
- **Outra hospedagem que permita uso comercial no plano gratuito:** aberta na SPEC para avaliação na T0; não foi adotada.
- **Supabase Free com rotina própria de backup:** o "plano mínimo" da SPEC se o Pro não for contratado. Não adotada como padrão.

## Consequências
- A tarefa T14 (produção) inclui a migração de planos como pré-requisito de dado real.
- Os dados de demonstração do app são ficção e ficam rotulados.
- O preço do Pro deve ser conferido na página oficial no momento da contratação.
