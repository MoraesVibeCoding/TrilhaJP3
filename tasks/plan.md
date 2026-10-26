# Roadmap: TrilhaJp3 (v1, módulo Projetos e demandas)

Status: **proposta, aguardando "DE ACORDO" do Pedro.** Base: `docs/SPEC.md` (aprovada), `docs/STATUS.md`, revisão de 2026-10-22.
Skills usadas para montar: `planning-and-task-breakdown`, `spec-driven-development`, `find-skills` (a busca no skills.sh falhou; nenhuma skill nova foi recomendada).
Tarefas rastreadas em GitHub Issues (`docs/agents/issue-tracker.md`). Os issues só serão criados depois da aprovação.

## 1. Revisão do que já foi feito

| Item                              | Estado real                                                                                                                                            | Problema                                                                                                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T0 base, Prettier, CI, Playwright | Pronto. CI #1 e #2 verdes.                                                                                                                             | CI do commit `60970dc` (#3) e dos commits da T1 nunca conferidos. Secret scanning do GitHub ainda desligado.                                                                                                                         |
| T1 design base                    | Código pronto e testado (14 testes unitários, 4 E2E).                                                                                                  | **Foi feita sem o processo do `impeccable`**: não houve rodada de 3 propostas para aprovação, nem revisor final, nem sidecar `.impeccable/design.json`. A casca e a Visão geral foram decisões minhas, só validadas por 3 perguntas. |
| Next 16                           | Build e testes passam.                                                                                                                                 | `AGENTS.md` manda ler `node_modules/next/dist/docs/` antes de codar. **Não li.** Layout, fontes, `next/link` e `suppressHydrationWarning` não foram conferidos contra a fonte.                                                       |
| Supabase                          | Host alcançável.                                                                                                                                       | Chave **não** chega à sessão (`401`, nenhuma `SUPABASE_*`). Bloqueia a T2. Falta também o token de migração.                                                                                                                         |
| Hooks do `impeccable`             | Instalados em `.claude/settings.local.json` (local).                                                                                                   | Decisão de 2026-10-23: manter (R4).                                                                                                                                                                                                  |
| Dívidas conhecidas                | Tema salvo pisca o claro na hidratação (`shortcut:` no código). `npm audit`: 5 altos na cadeia de dev do ESLint. Dados de demonstração na Visão geral. | A tratar nas fases abaixo.                                                                                                                                                                                                           |
| Qualidade como contrato           | Não existe `CONSTRAINTS.md`.                                                                                                                           | Nada impede afrouxar teste, lint ou limites no futuro.                                                                                                                                                                               |

## 2. Regras de execução (valem para toda tarefa)

1. **Tudo de front e UI passa pelo `impeccable`.** Marcado com 🎨. Para cada tarefa 🎨: `impeccable shape` ou `new-work`, o `impeccable` avalia o contexto e traz **3 propostas**, o Pedro escolhe, só então se constrói. Fecha com o revisor final do `impeccable` e atualização do `DESIGN.md`.
2. Ciclo por tarefa: entrevista curta (`interview-me`, se houver ambiguidade), plano de 3 linhas, teste vermelho, código mínimo, refatorar, commits atômicos.
3. Fontes oficiais antes de código novo (`source-driven-development`). Next 16: `node_modules/next/dist/docs/`. Supabase: documentação oficial.
4. Tarefa de alto risco (RLS, auth, anexos, migração de produção): protocolo `doubt-driven-development` antes de fechar.
5. Definição de pronto: format, lint, typecheck, testes, build e E2E verdes com o log mostrado; revisão em 5 eixos (`code-review-and-quality`); PRs de até cerca de 100 linhas por bloco.
6. Nada de dado real da empresa antes da migração para Vercel Pro e Supabase Pro (D1 e D2).

## 3. Fases e tarefas

### Fase 0: Revisão e fundações

**R1. Conferir CI e ligar varredura de segredos** (Pedro, XS)

- [x] Aba Actions: CI do último commit da branch verde (repositório público, 2026-10-26).
- [x] Settings, Code security: Secret scanning ligado (2026-10-26).
- Dependências: nenhuma.

**R2. Auditar o código contra os docs do Next 16** (S)

- [x] Ler `node_modules/next/dist/docs/` nos temas que o app usa hoje (`cacheComponents`, `<Activity>`, hidratação, `next/font`); manifest fica para a T12. Resultado em `docs/AUDITORIA-NEXT16.md`.
- [x] Divergência encontrada (foco da janela após voltar e avançar) corrigida com teste unitário e E2E.
- Verificação: lint, typecheck, testes, build, E2E verdes.
- Dependências: nenhuma.

**R3. `CONSTRAINTS.md`: contrato de qualidade** (S, skill `constraint-driven-development`)

- [x] Entrevista curta feita em 2026-10-23: cobertura, segurança e acessibilidade; piso bloqueia, o resto avisa até 2026-11-06; medir e segurar; 90 s no fim da tarefa. Desempenho e arquitetura ficam para depois.
- [x] Limites escritos em `CONSTRAINTS.md`, com o guarda do piso, cobertura, `gitleaks` e axe verificados localmente. **Semgrep, osv-scanner e os passos novos do CI não foram conferidos no GitHub** (registros bloqueados neste ambiente).
- Dependências: nenhuma.

**R4. Decidir hooks do `impeccable`** (XS)

- [x] Decidido em 2026-10-23: **manter** os hooks. Registrado no `STATUS.md`.

**R5. Destravar o Supabase** (Pedro + S)

- [x] Segredo corrigido no ambiente (Sites permitidos).
- [x] `auth/v1/admin/users` responde `200` e `rest/v1/` responde o esquema (conferido em 2026-10-22).
- [ ] Token de acesso do Supabase para migrações fornecido (sem ir ao repositório).
- Dependências: nenhuma. **Bloqueia T2.**

**R6. Glossário e ADRs** (S, skill `documentation-and-adrs`)

- [x] `GLOSSARY.md` e `docs/adr/` (0001 hospedagem e planos, 0002 stack, 0003 multiempresa e RLS, 0004 Geist, 0005 marca V2, 0006 visões da Demandas), 2026-10-23.
- Dependências: nenhuma.

### Checkpoint 0

- [ ] CI verde, segredos ligados, Supabase respondendo `200`, `CONSTRAINTS.md` ativo. Revisão com o Pedro.

### Fase 1: Design base (T1 refeita pelo processo)

**T1-R. 🎨 Casca do app, Retomar e Demandas via `impeccable`** (M)

Decisões aprovadas em 2026-10-22: proposta **B, mesa dividida**. Entrada padrão **Retomar** (demandas em Fazendo, ordenadas pela última atividade, com a próxima subtarefa pendente). Página **Demandas** com visões trocáveis. A demanda abre em **janela sobre a página, fundo levemente fosco**. Contrato de direção em `.impeccable/surfaces/src-app-page-tsx.md`.

- [x] 3 propostas apresentadas; B escolhida.
- [ ] R2 concluída (Next 16 conferido nos docs) antes de qualquer código.
- [ ] Barra lateral recolhível no computador (aprovado, R1).
- [x] Interruptor Foco/Completo no cabeçalho (proposta C, ícone com atalho F) (aprovado, R1; `docs/PRINCIPIOS-OBJETIVOS.md` 5b), depois da janela da demanda.
- [x] Demanda "Agora" e "Feito hoje" no Retomar (proposta A, aprovada e construída).
- [x] Casca e Retomar construídas por testes; tema sem piscar na hidratação; contraste e teclado conferidos (WCAG 2.1 AA).
- [x] Janela da demanda (proposta A aprovada, construída): foco preso e devolvido, `Esc` e clique fora fecham, tela cheia no celular, fundo fosco sem perder contraste.
- [x] Revisor final do `impeccable` sem pendência material (disposition ship, 2026-10-22); `DESIGN.md` e `.impeccable/design.json` atualizados.
- Verificação: testes e E2E verdes, capturas em desktop, iPad e celular, claro e escuro.
- Dependências: R2, R3.

### Fase 2: Dados e acesso

**T2. Esquema inicial e RLS** (M)

- [ ] `organizations`, `memberships`, função `is_member(organization_id)`, RLS ligada em tudo.
- [ ] Teste de integração prova isolamento entre duas empresas (leitura e escrita negadas).
- [ ] Protocolo `doubt-driven-development` aplicado antes de fechar.
- Dependências: R5, R6.

**T3. 🎨 Login e sessão** (M)

- [ ] Telas de entrada e saída: 3 propostas via `impeccable`, aprovadas.
- [ ] `@supabase/ssr` com cookies; rota protegida redireciona; usuário logado vê só a própria empresa.
- [ ] Teste: não logado não acessa nada; mensagens de erro sem vazar dados.
- Dependências: T1-R, T2.

### Checkpoint 2

- [ ] Login ponta a ponta, isolamento provado, revisão de segurança parcial (OWASP: acesso e sessão).

### Fase 3: Módulo Projetos e demandas (fatias verticais)

**T4. 🎨 Projetos** (M): criar, editar, listar, arquivar. Validação com `zod`; testes de borda.
**T5. 🎨 Demandas e três estados** (M): criar num projeto, mover entre estados, histórico começa a existir na T10.
**T6a. 🎨 Retomar e Demandas em Tabela** (M) — ✅ tabela pronta com dados de demonstração (2026-10-23); falta trocar por dados reais na T5: troca os dados de demonstração por dados reais; filtros por status e prioridade; seletor de visão com lembrança da escolha.
**T6b. 🎨 Visão Por projeto** (S) — ✅ construída (2026-10-23), proposta B, cartões de projeto com "Ver mais N" (no lugar dos blocos recolhíveis).
**T6c. 🎨 Visão Quadro por estado** (S) — ✅ construída (2026-10-23), proposta A: colunas A fazer, Fazendo, Feito e menu "Mover para…" (arrastar fica como melhoria futura).
Depois da v1, sem depender de refazer nada: Por prioridade, Por prazo (precisa de data na demanda), Por etiqueta (precisa da T8).
**T5b. 🎨 Demanda em página inteira** (S) — ✅ construída (2026-10-26), proposta A (três colunas), revisão final do `impeccable` aplicada: rota `/demandas/[id]` com link permanente; a janela tem o atalho "Abrir em página inteira" (aprovado, R1).
**T6d. 🎨 Captura rápida** (S) — ✅ construída (2026-10-23), proposta B: botão "Nova demanda" e tecla `C` abrem uma janela de um campo, `Enter` cria, aviso de título parecido. Fica salva no navegador até a T5.
**T7. Subtarefas, um nível** (S): segundo nível rejeitado por regra e por teste.
**T8. 🎨 Etiquetas** (S): criar, aplicar, filtrar.
**T9. 🎨 Comentários** (S): escapados contra XSS; só membros da empresa leem.
**T10. Histórico por gatilhos** (M): todo evento gerado no banco; histórico só de leitura. Alto risco: `doubt-driven-development`.
**T11. 🎨 Anexos** (M): tipos e 10 MB validados no servidor e no bucket; arquivo de outra empresa inacessível. Alto risco.

Cada tarefa 🎨 repete a regra 1 (3 propostas, aprovação, revisor final). Critérios de aceite detalhados vêm da `docs/SPEC.md`, seção 6, e são reafirmados no issue de cada tarefa.

### Checkpoint 3

- [ ] Fluxo completo do Pedro: cadastrar projeto, criar demandas com subtarefas, etiqueta, comentário e anexo, ver tudo na Visão geral.

### Fase 4: Entrega

**T12. 🎨 PWA** (S) — ✅ construída (2026-10-26), ícone A (Floresta): manifest e ícones do kit; instalável no computador, iPad (manual) e celular. Spec em `tasks/t12-spec.md`.
**T13. Endurecimento e observabilidade** (M): revisão OWASP sem pendência crítica, cabeçalhos de segurança, logs estruturados, métricas RED, rotina de backup documentada (`security-and-hardening`, `observability-and-instrumentation`).
**T14. Produção** (M): migração para Vercel Pro e Supabase Pro (D1 e D2) **antes de dado real**, deploy progressivo, rollback testado, domínio `trilhajp3.com` se aprovado (`shipping-and-launch`, `ci-cd-and-automation`).

### Checkpoint final

- [ ] Todos os critérios da spec atendidos, CI verde, rollback testado, revisão final do Pedro.

## 4. Riscos

| Risco                             | Impacto                 | Mitigação                                            |
| --------------------------------- | ----------------------- | ---------------------------------------------------- |
| Supabase sem chave na sessão      | Alto, bloqueia T2 a T11 | R5 primeiro; testes de RLS contra o projeto de teste |
| Escopo grande da v1               | Médio                   | Fatias verticais, checkpoint a cada fase             |
| Decisões de UI sem as 3 propostas | Médio                   | Regra 1; T1 refeita                                  |
| Tema e PWA no iPad                | Baixo                   | Testes E2E e captura no tamanho do iPad              |
| Marca sem registro no INPI        | Baixo                   | Pedro solicita; fora do código                       |

## 5. Perguntas em aberto

1. Ordem preferida entre T1-R (design) e R5 (Supabase) se ambos puderem andar juntos.
2. Criar os issues no GitHub agora (um por tarefa), ou manter só este plano por enquanto?
3. Hooks do `impeccable` (R4): manter ou remover.
