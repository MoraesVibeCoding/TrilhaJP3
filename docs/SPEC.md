# SPEC — TrilhaJp3 v1 (módulo Projetos e demandas)

Status: **aprovada pelo Pedro ("DE ACORDO") em 2026-10-21**, incluindo as decisões D1 e D2 abaixo.
Origem: entrevista de requisitos (grilling) em 2026-10-21. Empresa: Moraes CodeVibe.

## 1. Objetivos

TrilhaJp3 será o sistema de gestão da Moraes CodeVibe, com possibilidade de venda a outras empresas no futuro. A v1 entrega apenas o primeiro módulo: **Projetos e demandas**.

Sucesso da v1:

1. O Pedro cadastra manualmente os projetos que já tem em andamento e organiza as demandas de cada um.
2. Cada demanda tem subtarefas, etiquetas, comentários, anexos e histórico de alterações.
3. Uma tela única mostra todos os projetos e demandas.
4. O app abre no computador, no iPad e no celular, e pode ser instalado na tela de início (PWA).
5. Os dados já nascem organizados por empresa (multiempresa), mesmo existindo uma só empresa na v1.

Não há prazo fixo. A regra é qualidade primeiro, em fatias pequenas, cada uma com teste passando.

## 2. Decisões já tomadas

| Tema | Decisão |
|---|---|
| Usuários | Só o Pedro na v1, com login obrigatório. Banco preparado para mais usuários e mais empresas. |
| Dispositivos | Principal: computador e iPad. Celular para consulta. Site responsivo instalável (PWA). |
| Idioma | Interface em português do Brasil. Identificadores de código em inglês. |
| Dados iniciais | Sem importação. Projetos cadastrados manualmente pela interface. |
| Stack | Next.js, TypeScript, Supabase (Postgres, Auth, Storage), Vercel, Vitest, Playwright. |
| Marca | Kit em `docs/brand/` (tokens `--mcv-*`, cores, logos, modo claro e escuro). **Tipografia: exceção decidida pelo Pedro em 2026-10-22, Geist no lugar de Fraunces, Inter e JetBrains Mono.** |
| Design | Toda decisão de design e layout passa pela skill `impeccable`. Acessibilidade WCAG 2.1 AA. |
| Anexos | Imagens, PDFs e documentos de escritório, até 10 MB, executáveis bloqueados. |
| Domínio | `trilhajp3.com` (disponível segundo o Pedro, compra pendente). A v1 começa no endereço padrão da hospedagem. |

## 3. Decisões D1 e D2 (resolvidas)

**Resolução aprovada:** desenvolver nos planos gratuitos e migrar para Vercel Pro e Supabase Pro **antes de entrar qualquer dado real da empresa**. Estas duas decisões vieram da verificação na documentação oficial e contradizem a premissa de "plano gratuito basta".

**D1. Hospedagem na Vercel.** O plano gratuito (Hobby) é limitado a uso pessoal e não comercial, e a Vercel define uso comercial de forma ampla, incluindo qualquer deploy usado para ganho financeiro de quem participa do projeto. Um sistema de gestão de uma empresa não se enquadra no Hobby. A Vercel pode desativar projetos do plano Hobby, com ou sem aviso. Recomendação: usar o plano Pro antes de colocar dados reais da empresa. Alternativa: escolher outra hospedagem que permita uso comercial no plano gratuito, a avaliar na tarefa T0. O preço atual do Pro precisa ser conferido na página oficial de preços no momento da contratação.

**D2. Supabase gratuito.** O plano Free tem banco de 500 MB, 1 GB de arquivos, **sem backups automáticos**, e pausa projetos com pouca atividade na semana. O plano Pro (a partir de US$ 25 por mês) não pausa e inclui backups diários guardados por 7 dias. Recomendação: desenvolver no Free e migrar para o Pro antes de entrar dado real. Sem isso, o plano mínimo é uma rotina própria de backup.

## 4. Arquitetura

### 4.1 Visão geral

- Aplicação Next.js (App Router) com TypeScript estrito, renderizada no servidor, falando com o Supabase.
- Supabase Auth com cookies de sessão no servidor (pacote `@supabase/ssr`).
- Postgres com **Row Level Security (RLS) em todas as tabelas**. O acesso é negado por padrão, e cada tabela tem políticas explícitas por empresa.
- Supabase Storage para anexos, com políticas por empresa.
- Código organizado em módulos por domínio (`projects`, depois `finance`, `clients`, etc.), para que novos módulos entrem sem mexer nos existentes.

### 4.2 Modelo de dados

Toda tabela de negócio tem `organization_id`. IDs são UUID. Datas em `timestamptz`.

- `organizations` (id, name, created_at)
- `memberships` (organization_id, user_id, role: `owner` | `member`)
- `projects` (id, organization_id, name, description, status: `idea` | `in_progress` | `paused` | `done`, priority: `high` | `medium` | `low`, link nullable, created_by, created_at, updated_at, archived_at nullable)
- `tasks` (id, organization_id, project_id, parent_task_id nullable, title, description, state: `todo` | `doing` | `done`, priority, due_date nullable, created_by, created_at, updated_at, archived_at nullable)
- `labels` (id, organization_id, name, color) e `task_labels` (task_id, label_id)
- `comments` (id, organization_id, task_id, author_id, body, created_at, edited_at nullable)
- `attachments` (id, organization_id, task_id, storage_path, file_name, mime_type, size_bytes, uploaded_by, created_at)
- `task_events` (id, organization_id, task_id, actor_id, type, changes jsonb, created_at): histórico, só inserção.

Regras de modelagem propostas (podem ser vetadas):

1. Subtarefas usam `parent_task_id` na mesma tabela, com **um único nível** de profundidade.
2. O histórico é gravado por **gatilhos no banco**, não pelo código da aplicação, para que nenhuma alteração escape do registro.
3. Exclusão é lógica (`archived_at`), não física, nas tabelas principais.
4. Anexos ficam em `{organization_id}/{task_id}/{uuid}-{nome}` no Storage.

### 4.3 Segurança (OWASP Top 10)

1. Controle de acesso: RLS em todas as tabelas e no Storage. Uma função `is_member(organization_id)` centraliza a regra. Testes de integração provam que um usuário de outra empresa não lê nem escreve nada.
2. Validação de entrada em toda borda (formulários, ações do servidor) com um esquema tipado (zod).
3. Anexos: lista de tipos permitidos, limite de 10 MB e bloqueio de executáveis, validados no servidor e na configuração do bucket. Os detalhes de configuração do bucket serão confirmados na documentação na tarefa T11.
4. Segredos nunca vão para o repositório nem para o navegador. Só a chave pública do Supabase vai ao cliente, e a chave de serviço fica apenas no servidor. O repositório terá a varredura de segredos nativa do GitHub ativada nas configurações (decisão de 2026-10-21: o gitleaks-action exige licença para repositórios de organização).
5. Cabeçalhos de segurança e proteção contra XSS (conteúdo de comentários é sempre escapado).

### 4.4 Estilo de código

- TypeScript com `strict: true`, ESLint e Prettier, aplicados no CI.
- Funções pequenas, módulos por domínio, sem abstração antes de haver uso real.
- Commits atômicos em Conventional Commits, uma fatia vertical por vez.
- Mudanças de banco só por migrações versionadas, reversíveis quando possível.
- Alterações em código crítico de produção usam feature flag ou padrão substituto seguro.

### 4.5 Estratégia de testes

Ciclo Red-Green-Refactor. Pirâmide: 80% unitários, 15% integração, 5% E2E.

- **Unitários (Vitest):** regras de domínio, validações, formatação.
- **Integração:** políticas RLS, gatilhos de histórico e migrações contra um Supabase local (requer Docker; se não estiver disponível no ambiente, a alternativa é um projeto Supabase de teste, a decidir na T0).
- **E2E (Playwright):** login, criar projeto, criar demanda, mover de estado, anexar arquivo.
- **Acessibilidade:** verificação automatizada (axe) mais checagem manual de teclado e leitor de tela.
- Regra de aceite: nenhuma tarefa é concluída sem o log do terminal mostrando 100% dos testes passando.

### 4.6 Observabilidade e entrega

- Logs estruturados em JSON, com id de requisição.
- Métricas RED (taxa, erros, duração) das rotas principais, via OpenTelemetry. A forma exata de integração com a hospedagem será confirmada na documentação na tarefa T13.
- CI no GitHub Actions: formatação, lint, tipos, testes e build.
- Deploy com prévia por branch. Rollback pelo painel da hospedagem. Mudanças de banco em duas etapas (adicionar, depois remover) para que o rollback do app seja seguro.

## 5. Limites do escopo

**Dentro da v1:** tudo da seção 1 e do modelo da seção 4.2.

**Fora da v1:** cadastro de novas empresas, cobrança e planos, outros módulos (financeiro, clientes, administrativo), notificações, modo offline, importação de dados, integrações externas, aplicativo de loja.

## 6. Plano macro de tarefas atômicas

Cada tarefa vira um conjunto de commits pequenos, com critério de aceite próprio. A próxima tarefa só começa quando a anterior passa nos testes.

| # | Tarefa | Critério de aceite |
|---|---|---|
| T0 | Base do projeto, CI e decisões D1 e D2 | Projeto sobe localmente, CI roda lint, tipos e um teste de exemplo verdes, hospedagem e plano do banco definidos. |
| T1 | Design base com `impeccable` | `PRODUCT.md` e `DESIGN.md` criados a partir do kit, tokens e fontes aplicados, casca do app em claro e escuro. |
| T2 | Esquema inicial: empresas, vínculos e RLS | Teste de integração prova isolamento entre duas empresas. |
| T3 | Login e sessão | Usuário não logado não acessa nada, logado acessa a própria empresa. |
| T4 | Projetos (criar, editar, listar, arquivar) | Fluxo completo coberto por teste, validação de bordas. |
| T5 | Demandas e três estados | Demanda criada num projeto, movida entre estados, coberta por teste. |
| T6 | Tela única de visão geral | Lista projetos e demandas, filtros por status e prioridade. |
| T7 | Subtarefas (um nível) | Segundo nível é rejeitado, teste cobre a regra. |
| T8 | Etiquetas | Criar, aplicar e filtrar por etiqueta. |
| T9 | Comentários | Comentário escapado contra XSS, só membros da empresa leem. |
| T10 | Histórico de alterações | Toda alteração gera evento por gatilho, o histórico é só de leitura. |
| T11 | Anexos | Tipo e tamanho inválidos rejeitados, arquivo de outra empresa inacessível. |
| T12 | PWA | Manifest e ícones do kit, instalável no computador, iPad e celular. |
| T13 | Endurecimento e observabilidade | Revisão de segurança OWASP sem pendência crítica, logs e métricas ativos, rotina de backup documentada. |
| T14 | Produção | Deploy com rollback testado e, se aprovado, domínio `trilhajp3.com` ligado. |

## 7. Riscos

1. **Licença da hospedagem e backups do banco** (D1 e D2): se ignorados, risco de o projeto ser desativado e de perda de dados.
2. **Escopo grande para a v1:** cinco recursos de demanda de uma vez. A divisão em fatias reduz o risco, mas o prazo é aberto.
3. **PWA no iPad:** a instalação no iOS é manual (Compartilhar, depois Adicionar à Tela de Início), sem aviso automático.
4. **Marca:** o pedido de registro no INPI ainda não foi feito. Domínio disponível não equivale a marca protegida.

## 8. Fontes consultadas

- Supabase, preços e limites do plano gratuito: https://supabase.com/pricing
- Supabase, pausa de projetos gratuitos: https://supabase.com/docs/guides/platform/free-project-pausing
- Vercel, diretrizes de uso justo (Hobby é não comercial): https://vercel.com/docs/limits/fair-use-guidelines
- Vercel, plano Hobby: https://vercel.com/docs/plans/hobby
- Next.js, guia de PWA e `manifest`: https://nextjs.org/docs/app/guides/progressive-web-apps
- Supabase, Next.js com `@supabase/ssr`: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase, Auth e RLS: https://supabase.com/docs/guides/auth
