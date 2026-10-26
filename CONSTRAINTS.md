# Constraints

Última revisão: 2026-10-23, por Pedro Moraes (respostas à entrevista da skill `constraint-driven-development`).
Quem escreve código lê este arquivo antes. **Não se afrouxa este arquivo para fazer uma mudança passar.** Aperto é silencioso; afrouxamento é barulhento.

## Piso (sempre vale, bloqueia desde o primeiro dia)

- Sem novo comentário de supressão: `@ts-ignore`, `@ts-nocheck`, `eslint-disable`, `istanbul ignore`, `nosemgrep`, `gitleaks:allow`.
- Sem stub não implementado: `throw new Error("Not implemented")`, `catch {}` vazio e `TODO` no lugar do código.
- Sem teste pulado nem apagado sem motivo no commit: `.skip`, `.todo`, `xit`.
- Sem segredo no código.
- Este arquivo não é enfraquecido para fazer algo passar.

Verificado por: `node scripts/floor-guard.mjs --base origin/main` (leitura do diff; olha `src/`, `e2e/`, `scripts/` e `supabase/`, os limites de cobertura do `vitest.config.mts` e este arquivo, não o plugin de terceiros em `.claude/`).

## Imposto com números

Os limites de comportamento (marcados com ⏳) **avisam até 2026-11-06 e depois bloqueiam**. O piso e os demais bloqueiam desde já.

| Dimensão                                       | Regra                                                                                                                                          | Verificado por                                                                          | Roda em                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| Tipos                                          | Zero erros de tipo                                                                                                                             | `npm run typecheck`                                                                     | cada edição, CI                |
| Lint                                           | Zero erros                                                                                                                                     | `npm run lint`                                                                          | cada edição, CI                |
| Formato                                        | Prettier sem diferença                                                                                                                         | `npm run format:check`                                                                  | fim da tarefa, CI              |
| Piso                                           | Zero violações do piso                                                                                                                         | `node scripts/floor-guard.mjs --base origin/main`                                       | cada edição, CI                |
| Segredos                                       | Nenhum achado novo além da linha de base                                                                                                       | `gitleaks detect --baseline-path gitleaks-baseline.json --redact --no-banner`           | cada edição, CI                |
| Cobertura do código novo ⏳                    | Linhas alteradas com ≥ 80% de cobertura                                                                                                        | `npx vitest run --coverage` e `node scripts/coverage-changed.mjs`                       | fim da tarefa, CI              |
| Cobertura do projeto                           | Linhas ≥ 96.6%, instruções ≥ 96.4%, ramos ≥ 92.9%, funções ≥ 95.6%                                                                             | `npx vitest run --coverage` (limites no `vitest.config.mts`)                            | fim da tarefa, CI              |
| Segurança do código ⏳                         | Nenhum achado de severidade ERROR                                                                                                              | `semgrep scan --config p/default --config p/owasp-top-ten --severity ERROR --error src` | CI                             |
| Segurança das dependências                     | Nada de severidade alta ou acima                                                                                                               | `npm audit --audit-level=high`                                                          | CI                             |
| Segurança das dependências, segunda opinião ⏳ | Nada de severidade alta ou acima                                                                                                               | `osv-scanner scan source -r .`                                                          | CI                             |
| Acessibilidade                                 | Zero violações críticas ou sérias, regras WCAG 2.1 A e AA (axe-core), 10 telas: Retomar, as 3 visões da Demandas e a janela, em claro e escuro | `npx playwright test e2e/accessibility.spec.ts`                                         | CI, fim de tarefa de interface |

Cada linha tem o comando que dá o veredito. Orçamento de tempo: o que roda a cada edição e no fim da tarefa fica em até 90 s (`npm run check:task`); scanners e E2E completos ficam no CI, sem limite.

### Por que esses números

- **80% no código novo:** alto o bastante para forçar um teste, baixo o bastante para uma linha de configuração.
- **Projeto: o valor de hoje menos 0,5%:** a cobertura medida em 2026-10-23 foi 97,12% das linhas; 0,5% absorve a variação de um arquivo sem relação. Ninguém precisa escolher uma meta: o limite é não piorar.
- **Segurança: nada alto ou acima:** abaixo disso é, na maior parte, ruído.
- **Acessibilidade zero crítico ou sério:** é regra do produto (`PRODUCT.md`, WCAG 2.1 AA) e a única checagem que o agente não pode contornar escrevendo código que não funciona: o axe-core é externo.

### O que foi verificado e o que não foi

| Checagem                                               | Estado                                                                                                                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Piso, cobertura, segredos, `npm audit`, acessibilidade | Rodaram localmente em 2026-10-23 e passam. O axe foi provado contra uma página com defeitos conhecidos, o `gitleaks` contra um token novo e o `npm audit` contra um pacote com falha conhecida. |
| Semgrep                                                | Rodou localmente em 2026-10-25: 0 achados em 57 arquivos. No CI, ainda não verificado.                                                                                                          |
| osv-scanner                                            | Rodou localmente em 2026-10-25: nenhum problema em 514 pacotes. No CI, ainda não verificado.                                                                                                    |
| Passos novos do CI                                     | Escritos mas **não conferidos no GitHub**.                                                                                                                                                      |

## Medido, ainda não imposto

| Métrica                          | Hoje                                                                                                                                                                                                                                                                               | Direção     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Cobertura do projeto, linhas     | 97.12%                                                                                                                                                                                                                                                                             | não cair    |
| Cobertura do projeto, instruções | 96.91%                                                                                                                                                                                                                                                                             | não cair    |
| Cobertura do projeto, ramos      | 93.42%                                                                                                                                                                                                                                                                             | não cair    |
| Cobertura do projeto, funções    | 96.17%                                                                                                                                                                                                                                                                             | não cair    |
| Achados do gitleaks no histórico | 0. O repositório público começou em 2026-10-26 com um commit único, sem histórico; os 3 falsos positivos antigos (nomes de itens do navegador com "key") ficaram no repositório privado de origem e os nomes foram trocados. Evite nomear constantes com "key" ao guardar um texto | não crescer |
| Testes                           | 222 unitários e 91 E2E                                                                                                                                                                                                                                                             | não cair    |

## Exceções

| ID  | Regra | Caminho | Motivo | Dono | Expira |
| --- | ----- | ------- | ------ | ---- | ------ |
