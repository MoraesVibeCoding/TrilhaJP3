# T13: endurecimento e observabilidade

Status: **aprovada pelo Pedro em 2026-11-11 ("De acordo").**

Decisões do Pedro em 2026-11-11:

- logs e métricas ficam só no painel da Vercel, sem serviço externo;
- os arquivos órfãos do Storage são limpos por um script manual, que só apaga depois de confirmação;
- o backup continua manual, agora incluindo os anexos;
- CSP sem nonce, para manter o `cacheComponents` (ver o item "Mudança na spec" abaixo).

Base: `docs/SPEC.md` (seções 4.3 e 4.6, linha T13 da seção 6), ADR 0001, ADR 0002, `docs/OPERACAO-BACKUP.md`, `CONSTRAINTS.md`.

Documentação oficial consultada em 2026-11-11:

- Next.js 16.4.2, guias da própria versão em `node_modules/next/dist/docs`:
  - `01-app/02-guides/content-security-policy.md`. Diz que a CSP com nonce exige renderização dinâmica e que "Partial Prerendering (PPR) is incompatible with nonce-based CSP". A seção "Without Nonces" traz a CSP em `next.config` com `'unsafe-inline'`.
  - `01-app/02-guides/open-telemetry.md`: `@vercel/otel` e os spans padrão do Next.
- Vercel, [Observability](https://vercel.com/docs/observability) e [CLI logs](https://vercel.com/docs/cli/logs). Os logs de runtime aparecem no painel e na CLI, com filtro por `level`. A própria página avisa: "Most metrics require Observability Plus".
- Supabase, [Download Objects](https://supabase.com/docs/guides/storage/management/download-objects). Os arquivos do Storage ficam fora do dump do banco e precisam de cópia à parte.

## Mudança na spec (precisa da sua aprovação)

1. **CSP sem nonce.** A spec 4.3 pedia proteção contra XSS; a T13 escolheria a CSP. O nonce não funciona com o `cacheComponents` (ADR 0002), então a CSP aceita os scripts inline do Next (`'unsafe-inline'`). Escolha sua de 2026-11-11.
2. **Métricas sem OpenTelemetry.** A spec 4.6 dizia "via OpenTelemetry". A Vercel já mede, sem código, cada requisição: taxa, status e duração. Isso cobre o RED das rotas. O `@vercel/otel` só mandaria spans para um serviço externo, que você não quer agora, e por isso não entra (nenhuma dependência nova). Ponto em aberto: quais métricas o plano sem Observability Plus mostra no painel. Isso só dá para conferir com o app publicado, então fica como critério da T14.

## 1. Objetivo

Antes de entrar dado real:

- nenhuma brecha crítica de segurança;
- quando algo falha em produção, o Pedro descobre o quê e onde pelo painel da Vercel;
- o backup cobre o banco e os anexos, com um passo a passo que já foi testado.

## 2. Requisitos funcionais

1. **Cabeçalhos de segurança** em todas as respostas do app:
   - `Content-Security-Policy`:
     - `default-src 'self'`;
     - `script-src 'self' 'unsafe-inline'`, com `'unsafe-eval'` só em desenvolvimento, como o guia manda;
     - `style-src 'self' 'unsafe-inline'`;
     - `img-src 'self' blob: data:` mais o host do Supabase (miniaturas por link assinado);
     - `connect-src 'self'` mais o host do Supabase (login e envio de anexos pelo navegador);
     - `font-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` e `upgrade-insecure-requests`.
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Sem `preload`, porque o domínio ainda não foi comprado.
   - `X-Content-Type-Options: nosniff`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy`: câmera, microfone e localização desligados.

   O host do Supabase vem de `NEXT_PUBLIC_SUPABASE_URL`. Sem essa variável, o build falha com uma mensagem clara.

2. **Logs estruturados:**
   - cada falha de Server Action e cada erro inesperado do servidor gera uma linha JSON com `level`, `event` e `requestId`, mais, conforme o caso, o alvo (`target`), o `status`, a duração (`durationMs`), a rota e a mensagem de erro;
   - o `requestId` vem do id que a Vercel põe na requisição (cabeçalho `x-vercel-id`, confirmado em [Request headers](https://vercel.com/docs/headers/request-headers) em 2026-11-11). Fora dela, o Proxy gera um;
   - os logs nunca levam senha, token, chave, conteúdo de comentário ou nome de arquivo do usuário. Levam só ids e mensagens de erro.
3. **Arquivos órfãos:** o comando `npm run storage:orphans` lista os objetos do bucket `attachments` que não têm linha em `attachments` e foram criados há mais de 24 horas. As 24 horas evitam apagar um envio em andamento. A lista sai na tela. Com `--apply`, o script mostra a lista, pede que o Pedro digite `apagar` e só então remove. Ele roda no computador do Pedro, com a chave de serviço numa variável de ambiente, nunca no repositório.
4. **Backup dos anexos:**
   - o comando `npm run storage:backup -- <pasta>` baixa todos os objetos do bucket para uma pasta fora do repositório, mantendo os caminhos;
   - no fim, confere a contagem e o tamanho total contra o que está no Storage;
   - `docs/OPERACAO-BACKUP.md` ganha o passo dos anexos e o da restauração deles;
   - o teste de restauração passa a cobrir os anexos.
5. **Revisão OWASP Top 10:** um documento novo, `docs/SEGURANCA.md`, com cada item de A01 a A10. Para cada um: o que o app faz, a evidência (teste, arquivo ou checagem do CI) e o que fica pendente, com a gravidade. Achado crítico ou alto é corrigido nesta tarefa. Médio ou baixo fica registrado, com dono e prazo.

## 3. Requisitos não funcionais

1. **Sem dependência nova.** Os scripts usam o `@supabase/supabase-js`, que já está no projeto.
2. **Sem mudança de tela.** Por isso não há propostas do `impeccable`. Se a CSP quebrar algo visível, isso é tratado como defeito, não como redesenho.
3. **Desempenho:** a CSP fica em `next.config` (`headers()`), sem trabalho por requisição, e o `cacheComponents` continua ligado.

## 4. Contratos afetados

1. `next.config.ts` ganha `headers()`, montado por uma função pura (`src/lib/security-headers.ts`) que dá para testar.
2. `src/lib/log.ts`: `logError(event, fields)` escreve uma linha JSON em `console.error`, só com os campos de uma lista fechada. Ela é chamada em 3 pontos centrais, sem mudar o que as ações devolvem (`true`/`false`). Isso decidi na fatia 2, no lugar de editar as cerca de 20 saídas de erro das ações:
   - o cliente do Supabase no servidor (`global.fetch`): toda resposta de erro do banco, do Storage ou do Auth vira `supabase.error`, com alvo, status e duração. O alvo não leva ids, filtros nem nomes de arquivo, e o corpo da resposta não entra no log;
   - `update()` das demandas: a recusa silenciosa da RLS (nenhuma linha alterada) vira `tasks.update.no_rows`;
   - `src/instrumentation.ts` (`onRequestError`): todo erro que o Next captura no servidor vira `request.error`, com rota, tipo (`render` ou `action`) e caminho sem a query.

   Entrada inválida recusada pelo `zod` não é logada: é defeito do cliente, e não do servidor.

3. `src/proxy.ts` grava o `requestId` no cabeçalho `x-request-id` da requisição, sobrescrevendo o que o cliente mandar. A sessão do Supabase não muda.
4. `scripts/storage.mjs`, um arquivo só com o código comum e os comandos `orphans`, `backup` e `restore` (decidido na fatia 3):
   - o backup grava um `manifest.json` com caminho, tamanho e tipo de cada arquivo;
   - `npm run storage:restore -- <pasta>` envia os arquivos de volta, porque o bucket recusa envio sem tipo;
   - o E2E apaga os arquivos da empresa de teste no `resetDemo` e no fim da execução. Antes, um teste que falhava antes de remover o anexo deixava um órfão (17 no projeto de teste em 2026-11-13).
5. Banco: nenhuma migração.

## 5. Fora do escopo

- Serviço externo de logs, alertas ou métricas.
- CSP com nonce ou com SRI.
- Limpeza automática dos órfãos e backup automático.
- Limite de tentativas próprio no login. O Supabase Auth já limita, e isso fica registrado em `docs/SEGURANCA.md`.
- Deploy, domínio e conferência do painel da Vercel: ficam para a T14.

## 6. Testes e critérios de aceitação

1. **Unitários:**
   - `security-headers`: cada diretiva, o host do Supabase, `'unsafe-eval'` só em desenvolvimento e erro sem a URL;
   - `log`: formato JSON, `requestId`, e nenhum campo proibido (um teste passa um token e confere que ele não sai);
   - as ações registram a falha e continuam devolvendo `false`.
2. **Banco e Storage (`npm run test:db`):**
   - os órfãos achados são só os objetos sem linha e com mais de 24 horas;
   - `--apply` sem a confirmação não apaga nada;
   - o backup baixa todos os objetos e a contagem bate.
3. **E2E:**
   - as respostas trazem os cabeçalhos;
   - a navegação pelas telas principais não dispara nenhuma violação de CSP no console. Isso cobre o login, a Retomar, Demandas nas 3 visões, a janela, a página inteira, enviar e abrir anexo, e Projetos;
   - a suíte inteira continua verde.
4. **Checagens:** todas as do `CONSTRAINTS.md`. A revisão OWASP fecha sem pendência crítica nem alta.
5. **Backup:** teste de restauração dos anexos num projeto novo do Supabase, feito por você no seu computador, com o resultado anotado em `docs/OPERACAO-BACKUP.md`. Eu não consigo rodar isso daqui, porque a conexão direta ao banco não funciona neste ambiente.

## 7. Fatias

1. Cabeçalhos e CSP, com testes unitários e E2E. Cerca de 50 min (estimativa).
2. Logs JSON com `requestId` nas ações, com testes. Cerca de 50 min.
3. Scripts de órfãos e de backup dos anexos, testes de banco e o guia de operação. Cerca de 1h.
4. Revisão OWASP em `docs/SEGURANCA.md` e correção do que for crítico ou alto. Cerca de 1h, mais o que a revisão encontrar.
5. `docs/STATUS.md`, `docs/SPEC.md` (as 2 mudanças acima) e a PR. Cerca de 20 min.

Total estimado: cerca de 4 horas, sem contar as correções da revisão.

## 8. Riscos

1. **`'unsafe-inline'`:** se um script for injetado, a CSP não o bloqueia. Isso é mitigado por:
   - o React escapa todo texto;
   - o app não renderiza HTML de usuário;
   - os únicos `dangerouslySetInnerHTML` são os scripts de tema e de modo, com conteúdo fixo;
   - `object-src`, `base-uri`, `form-action` e `frame-ancestors` fechados.
2. **CSP quebrando uma tela:** o E2E da seção 6 procura violações no console. Uma tela fora do roteiro pode escapar.
3. **Métricas no plano gratuito da Vercel:** podem ser poucas sem o Observability Plus. Isso será conferido na T14. Se forem insuficientes, a alternativa é um serviço externo, que hoje você não quer.
4. **Chave de serviço no computador do Pedro:** os scripts precisam dela. Ela fica numa variável de ambiente da sessão do terminal, como no `OPERACAO-BACKUP.md`, nunca em arquivo versionado.
