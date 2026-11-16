# T14: produção

Status: **fatias 1 e 3 aprovadas pelo Pedro em 2026-11-16, para hoje; o resto, depois.**

Decisões do Pedro em 2026-11-16:

- o projeto Supabase de teste atual (`wbvucx…`, us-east-1) vira produção. Um projeto novo, Free, passa a servir o CI e as sessões de desenvolvimento;
- o primeiro deploy é um ensaio no Vercel Hobby, sem dado real. Os dois planos Pro são contratados pelo Pedro antes do primeiro dado real (ADR 0001);
- a v1 fica no endereço `*.vercel.app`, e o domínio `trilhajp3.com` fica para depois;
- o rollback é provado com um ensaio de Instant Rollback.

Confirmado pelo Pedro, também em 2026-11-16, que promover o projeto exige 3 passos:

1. um projeto de teste novo;
2. a troca dos segredos do CI e deste ambiente, feita pelo Pedro;
3. a limpeza dos restos de teste no projeto promovido.

**Mudança de 2026-11-16, decidida pelo Pedro ("hoje, com proteção mínima"):** o Pedro quer usar o app com dados reais hoje.

- Hoje entram só a fatia 1 (banco de teste separado e troca de segredos) e a fatia 3 (deploy).
- O Pedro faz um backup manual antes do primeiro dado real e contrata os planos Pro hoje ou nos próximos dias.
- A limpeza (fatia 2), o ensaio de rollback (fatia 4) e o guia (fatia 5) ficam para depois.
- Até o Pro, o uso real fica no Hobby e no Free, contra o ADR 0001: o Pedro aceitou o risco em 2026-11-16, ciente de 3 coisas: o Hobby não permite uso comercial, o Free não tem backup automático e o Free pausa um projeto parado.
- Os restos de teste no banco promovido ficam invisíveis para o Pedro, porque a RLS só mostra a empresa dele, e serão limpos na fatia 2.

Base: `docs/SPEC.md` (seção 4.6 e linha T14 da seção 6), ADR 0001, `docs/STATUS.md` (pendências 4 e 8), `docs/SEGURANCA.md` (S3), `docs/OPERACAO-BACKUP.md`.

Documentação oficial consultada em 2026-11-16:

- Vercel, [Rollback production deployment](https://vercel.com/docs/deployments/rollback-production-deployment) e [CLI rollback](https://vercel.com/docs/cli/rollback). No Hobby, só é possível voltar ao deploy de produção anterior; voltar mais que isso exige o Pro. O ensaio A → B → A cabe nesse limite.
- Supabase, [Password security](https://supabase.com/docs/guides/auth/password-security): a proteção contra senha vazada exige o plano Pro.

## 1. Objetivo

O app publicado na Vercel, com o banco de produção limpo e um rollback que já foi testado. Ao fim da T14 falta só você contratar os planos Pro para começar a usar o app com dados reais. Os testes nunca mais tocam o banco de produção.

## 2. Requisitos funcionais

1. **Projeto de teste novo (Free):**
   - eu crio o projeto e aplico as migrações com `npm run db:migrate`;
   - eu configuro o Auth como no atual: cadastro fechado e senha mínima de 12;
   - você troca os segredos do GitHub Actions (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) e as variáveis deste ambiente de nuvem para o projeto novo. Eu passo os valores públicos e você copia a chave de serviço do painel. Eu não guardo chave nenhuma;
   - critério: o CI fica verde contra o projeto novo, e esta sessão não alcança mais o projeto de produção com a chave de serviço.
2. **Limpeza do projeto promovido**, depois da troca do item 1:
   - um script lista o que sobrou dos testes: usuários `@example.test`, empresas que não são a Moraes Coding (e, em cascata, os projetos, demandas, comentários, etiquetas, anexos e eventos delas) e os arquivos dessas empresas no Storage;
   - ele só apaga depois de você digitar `apagar`, como o `storage:orphans`. A lista sai antes;
   - fica só a empresa Moraes Coding, com o seu usuário como dono.
3. **Deploy na Vercel (Hobby, ensaio):**
   - você importa o repositório num projeto da Vercel, ou autoriza o acesso da Vercel a esta sessão e eu crio o projeto;
   - as variáveis de produção são só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do projeto de produção. O app não usa a chave de serviço (conferido na T13, A02);
   - a `main` publica em produção, e cada branch ganha uma prévia. As prévias apontam para o projeto de teste, para que nenhuma prévia escreva em produção;
   - critério: você entra no app publicado, e as respostas trazem os cabeçalhos da T13.
4. **Ensaio de rollback:** com os deploys A (a `main`) e B (um commit de documentação), volto para o A com o Instant Rollback e confiro:
   - que o app responde;
   - que o deploy em produção é o A;
   - que o banco não mudou.

   Depois promovo o B de novo. O ensaio fica registrado no guia, com data e resultado.

5. **Métricas e logs:** confiro no painel da Vercel quais métricas de requisição o plano mostra sem o Observability Plus (taxa, erros e duração), e se as linhas JSON da T13 aparecem nos logs de runtime. O resultado vai para a seção 4.6 da `docs/SPEC.md`. Se as métricas não cobrirem o RED, isso vira uma pendência sua.
6. **Guia `docs/OPERACAO-PRODUCAO.md`:**
   - deploy, prévia, rollback e migração em duas etapas;
   - a lista do que fazer antes do primeiro dado real:
     - contratar o Vercel Pro e o Supabase Pro, com o preço conferido na página oficial;
     - ligar a proteção contra senha vazada (S3);
     - conferir o backup diário do Pro;
     - rodar o teste de restauração do banco e dos anexos.

## 3. Requisitos não funcionais

1. **Segurança:** a chave de serviço de produção fica só no painel do Supabase e com você. Ela nunca vai para a Vercel, para o CI ou para este ambiente.
2. **Sem mudança de tela** e sem dependência nova.
3. **Reversível:** o projeto promovido continua com o mesmo histórico de migrações. A limpeza é a única ação destrutiva e exige confirmação.

## 4. Contratos afetados

1. `scripts/cleanup-test-data.mjs`, novo: lista e apaga os restos de teste, com teste de banco no projeto de teste novo.
2. `.github/workflows/ci.yml`: não muda; só mudam os segredos, e quem muda é você.
3. A Vercel publica o build atual, sem `vercel.json`. Se a documentação exigir algum ajuste, eu registro antes.
4. Banco: nenhuma migração nova.

## 5. Fora do escopo

- Domínio próprio.
- Contratar os planos Pro, que fica com você.
- Entrar dado real.
- Serviço externo de métricas.
- Mudar a região do banco.

## 6. Testes e critérios de aceitação

1. CI verde contra o projeto de teste novo, com todas as checagens da T13 bloqueando.
2. Teste de banco do script de limpeza:
   - acha só usuários `@example.test` e empresas que não são a Moraes Coding;
   - sem a palavra `apagar`, não apaga nada;
   - com a palavra, apaga e a nova contagem dá 0.
3. Depois da limpeza na produção:
   - `supabase/tests/company.test.ts`, adaptado para ler produção só com leitura, confirma 1 empresa e 1 dono;
   - nenhum usuário `@example.test`;
   - nenhum arquivo fora da pasta da Moraes Coding.
4. App publicado:
   - login funciona;
   - os cabeçalhos de segurança aparecem;
   - nenhuma violação de CSP no console das telas principais. Isso é conferido por você no navegador e por mim com `curl` nos cabeçalhos.
5. Ensaio de rollback A → B → A registrado com os ids dos deploys.

## 7. Fatias

1. Projeto de teste novo, migrações e Auth; troca dos segredos por você; CI verde. Cerca de 40 min (estimativa), mais o tempo da sua troca.
2. Script de limpeza com teste e limpeza da produção, com a sua confirmação. Cerca de 50 min.
3. Deploy na Vercel e conferência. Cerca de 40 min, mais o tempo da importação ou da autorização.
4. Ensaio de rollback, métricas e logs. Cerca de 30 min.
5. `docs/OPERACAO-PRODUCAO.md`, `docs/STATUS.md`, `docs/SPEC.md` e a PR. Cerca de 25 min.

Total estimado: cerca de 3 horas, mais as etapas que dependem de você.

## 8. Riscos

1. **Teste contra produção por engano:** se os segredos do CI ou deste ambiente não forem trocados, os testes continuam criando e apagando dados no projeto que vira produção. Por isso a fatia 1 vem antes de tudo, e a limpeza (fatia 2) só roda depois da troca.
2. **A limpeza apagar demais:** o script mira só usuários `@example.test` e empresas que não são a Moraes Coding, mostra a lista antes e exige `apagar`. Faça o backup do banco e dos anexos antes (`docs/OPERACAO-BACKUP.md`).
3. **Hobby:** o uso comercial não é permitido. O ensaio não leva dado real, e o primeiro dado real só entra depois do Pro.
4. **Rollback no Hobby:** só volta ao deploy anterior. Isso basta para o ensaio, mas em produção real o Pro dá mais margem.
5. **Free pausa por inatividade:** o projeto promovido continua Free até o seu Pro. Se ele pausar antes disso, é só reativar no painel.
