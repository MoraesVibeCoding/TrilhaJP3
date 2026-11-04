# T10: histórico de alterações

Status: **aguardando aprovação do Pedro.** Decisões do Pedro em 2026-11-04:

- entram a demanda e o que ela tem: campos, subtarefas, etiquetas e comentários;
- cada linha mostra quem fez e quando;
- a tela passa por 3 propostas do `impeccable` em HTML.

Base: `docs/SPEC.md` (seção 4, `task_events`; seção 4.2, item 2: histórico por gatilhos; seção 6, linha T10), ADR 0003, `CONSTRAINTS.md`.

## 1. Objetivo

O Pedro abre uma demanda e vê o que aconteceu com ela, do mais novo ao mais antigo: quem mudou o quê e quando. Nenhuma alteração escapa do registro, porque quem grava é o banco, não o app. Ninguém edita nem apaga o histórico.

## 2. Requisitos funcionais

1. **O que gera evento:**

   | O que muda                                                                                         | Exemplo do texto                                            |
   | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
   | Demanda criada                                                                                     | "Criou a demanda"                                           |
   | Título, estado, prioridade, prazo, projeto, descrição, Agora (marcar ou tirar), arquivar ou voltar | "Estado: A fazer → Fazendo", "Prazo: sem prazo → 7 de nov." |
   | Subtarefa criada, renomeada, concluída ou reaberta, removida                                       | "Concluiu a subtarefa Contato"                              |
   | Etiqueta aplicada ou tirada                                                                        | "Aplicou a etiqueta Bug"                                    |
   | Comentário publicado ou apagado                                                                    | "Comentou", "Apagou um comentário"                          |

   Uma gravação que muda vários campos gera um evento por campo. A descrição não guarda o texto inteiro: o evento diz só "Mudou a descrição".

2. **Quem e quando:** cada linha mostra o autor ("Você" para o próprio) e a hora, no mesmo formato dos comentários ("hoje, 15h", "30 de out., 9h").
   - O nome é a parte do e-mail antes do @, gravada pelo banco no momento do evento, como nos comentários.
   - Mudança feita sem sessão (manutenção, carga de dados) aparece como "Sistema".
3. **Onde:** no grupo "Histórico" da janela e na coluna Histórico da página inteira, no lugar da lista que hoje fica sempre vazia. A ordem é do mais novo ao mais antigo.
4. **Só leitura:** ninguém altera nem apaga um evento, nem pelo app nem pela API.
5. **Mudanças que não entram:**
   - `updated_at` e `done_at`, que já são consequência do estado;
   - mudanças nas etiquetas da empresa (cor, nome);
   - mudanças em projetos.

## 3. Requisitos não funcionais

1. **Segurança:**
   - a tabela `task_events` tem RLS por empresa: membros leem e ninguém escreve;
   - os gatilhos são `security definer` com `set search_path = ''`, no schema `private`;
   - sem grant de insert, update ou delete para `authenticated`;
   - o texto exibido é montado no app a partir de `type` e `changes` e sempre aparece como texto.
2. **Desempenho:** cada demanda mostra os 50 eventos mais recentes. Há um índice em `(task_id, created_at desc)`.
3. **Acessibilidade:** a lista é um `<ol>` com a hora em `<time>`. Axe nos dois temas.
4. **Marca:** tokens `--mc-*`, hora em IBM Plex Mono, nenhum laranja novo.
5. **Dependências:** nenhuma nova.

## 4. Banco e contratos

1. **Migração nova, reversível, com rollback.** Tabela `task_events`:
   - `id`;
   - `organization_id` e `task_id`, com chave composta para a demanda, `on delete cascade`;
   - `actor_id`, com padrão `auth.uid()` e `on delete set null`;
   - `actor_name`, com padrão a parte do e-mail antes do @, ou "Sistema" sem sessão;
   - `type`, com `check` na lista de tipos da seção 2;
   - `changes` (`jsonb`, com antes e depois por campo, ou o nome da subtarefa ou da etiqueta);
   - `created_at`.
2. **Gatilhos `after`:**
   - em `tasks` (insert e update). Os eventos de subtarefa vão para a demanda mãe (`parent_task_id`);
   - em `task_labels` (insert e delete), com o nome da etiqueta no momento;
   - em `task_comments` (insert e update de `archived_at`).
3. **Eventos que já existem:** o histórico começa vazio. Não há como reconstruir o passado. As demandas atuais ganham só o que acontecer daqui em diante.
4. **Leitura:** `listDemands` passa a trazer os eventos de cada demanda, no formato da tela, com `mine` para os do usuário logado. O texto é montado por uma função pura, `describeEvent`, testada para cada tipo.

## 5. Design (3 propostas, `impeccable`)

O `impeccable` traz 3 propostas em HTML, nos dois temas, para a lista do histórico na janela e na página, por exemplo:

- agrupado por dia;
- linha do tempo;
- lista simples com autor e hora.

Só depois da escolha do Pedro a tela é construída.

## 6. Fora do escopo

- Filtrar ou buscar no histórico.
- Histórico de projetos.
- Desfazer uma mudança pelo histórico.
- Exportar o histórico.
- Notificações.
- Reconstruir eventos do passado.
- Mostrar o histórico na tabela, nos cartões e na Retomar.

## 7. Testes e critérios de aceitação

1. **Banco (`npm run test:db`):**
   - cada tipo da seção 2 gera o evento certo, com autor e nome vindos da sessão;
   - mudar vários campos de uma vez gera um evento por campo; mudar só `updated_at` não gera evento;
   - evento de subtarefa vai para a demanda mãe;
   - nenhum membro insere, altera ou apaga evento (`42501`);
   - membro de outra empresa não lê;
   - apagar a demanda apaga os eventos dela.
2. **Unitários:**
   - `describeEvent` cobre cada tipo e os valores vazios ("sem prazo");
   - a leitura traz até 50 eventos por demanda, do mais novo ao mais antigo, com `mine`.
3. **E2E:** mudar o estado e aplicar uma etiqueta na janela; recarregar e ver os dois eventos no histórico da janela e da página. Axe nos dois temas.
4. **Checagens:** todas as do `CONSTRAINTS.md`, mais o revisor final do `impeccable`.

## 8. Fatias

1. Migração, gatilhos, RLS e testes de banco. Cerca de 1h10 (estimativa).
2. `describeEvent` e leitura dos eventos, com testes unitários. Cerca de 40 min.
3. 3 propostas em HTML e escolha do Pedro. Cerca de 40 min.
4. Lista do histórico na janela e na página, com E2E. Cerca de 50 min.
5. Revisão final do `impeccable`, `DESIGN.md`, `docs/STATUS.md` e PR. Cerca de 25 min.

Total estimado: cerca de 4h05.

## 9. Riscos

1. **Volume:** "Agora" troca de demanda com frequência, e marcar uma demanda tira a anterior. Isso gera 2 eventos por troca. O limite de 50 por demanda segura a tela; a tabela cresce sem limite, o que é aceitável para uma pessoa.
2. **Gravação em lote:** a carga de demonstração dos E2E (`resetDemo`) recria as demandas pela chave de serviço. Isso gera eventos "Sistema", que os testes precisam considerar.
3. **Gatilho com erro bloqueia a gravação:** um erro no gatilho desfaz a mudança inteira. Os testes de banco cobrem cada caminho antes do merge.
