# Princípios de objetividade (método do sistema e do trabalho)

Status: **aprovada em 2026-10-22** (propostas 1 a 5 da seção 5, a 4 como interruptor Foco/Completo).
Origem: a forma de pensar da skill `i-have-adhd`, aplicada em duas frentes: **(A) o produto** (como o TrilhaJp3 se comporta) e **(B) o nosso método** (como trabalhamos nele).
Marcação: **◦** = julgamento meu a partir das 5 premissas da skill; não é recomendação clínica nem foi verificado em fonte.

## 1. As 5 premissas e o que elas pedem do sistema

| # | Premissa | Regra de produto |
|---|---|---|
| 1 | Memória de trabalho é pequena: o que não está na tela se esquece | A tela mostra o contexto. Nunca pedir que o Pedro "lembre". |
| 2 | Saber a resposta não é fazer | Cada tela termina em **uma ação**, não em informação. |
| 3 | Começar é o passo mais difícil | O primeiro passo é óbvio, pequeno e já pode ser feito. |
| 4 | Estimativas de tempo são vagas | Tempo em unidade concreta (minutos, horas), nunca "um pouco". |
| 5 | Dopamina é escassa: progresso precisa aparecer | O que foi feito fica visível, não enterrado. |

## 2. Regras do produto (A)

1. **Primeira linha = ação.** Cada tela abre com o que fazer agora. No Retomar, a primeira demanda já mostra "Próxima: …".
2. **Uma ação principal por tela.** Um botão de destaque. O resto é secundário.
3. **Passos numerados e curtos.** Subtarefas têm no máximo 5 visíveis; o resto atrás de "ver mais N".
4. **Estado repetido em toda tela.** "2 de 4 subtarefas", "Fazendo", "faltam 2". Nada de "continuamos de onde parou" sem dizer onde.
5. **Tempo concreto.** Subtarefa e demanda podem ter estimativa em minutos ou horas, e a tela soma.
6. **Progresso visível.** Seção **Feito hoje** no Retomar, com o que foi concluído.
7. **Erro direto.** "Não foi possível salvar: sem conexão. Tente de novo." Nada de "ops".
8. **Estado vazio com um passo.** "Nenhum projeto. Crie o primeiro." com um botão.
9. **Sem tangentes.** Nenhuma notificação, aviso ou sugestão fora do que o Pedro está fazendo (já é regra da v1: notificações ficam fora).
10. **Listas curtas.** Grupos de até 5 itens à vista; o restante recolhido, nunca descartado.

## 3. Como isso cai nas telas

| Tela | Aplicação |
|---|---|
| **Retomar** | Demanda "Agora" no topo, com próxima subtarefa; estimativa restante; **Feito hoje** abaixo; um botão de captura rápida |
| **Demandas** | Contagem por estado no topo; no máximo 5 grupos abertos; filtro lembrado entre visões |
| **Janela da demanda** | Próxima ação em destaque; subtarefas numeradas com "2 de 4"; estimativa e total; Histórico recolhido |
| **Captura rápida** | Um campo, `Enter` salva, volta ao que estava fazendo; sem formulário |
| **Erros e vazios** | Causa e próximo passo, em uma frase |

## 4. Análise do que já foi construído (Retomar atual)

| Regra | Hoje | Lacuna |
|---|---|---|
| Primeira linha = ação | Mostra a demanda e "Próxima: …" | OK. Falta destacar **uma** demanda "Agora". |
| Estado visível | "1 de 3 subtarefas" | OK |
| Tempo concreto | Não existe | **Falta** estimativa |
| Progresso visível | Não existe | **Falta** "Feito hoje" |
| Uma ação principal | Só o link "Todas as demandas" | **Falta** captura rápida |
| Sem ruído | A nota de dados de demonstração ocupa espaço | Sai quando houver dados reais (T6a) |

## 5. Propostas novas (todas aprovadas)

Fora das 3 já aprovadas na R1.

1. **Demanda "Agora":** marcar uma única demanda como foco; o Retomar a mostra no topo. Entra na **R1**.
2. **Estimativa em minutos** na subtarefa e na demanda, com soma. Entra na **R2**, junto com prazos.
3. **Feito hoje** no Retomar. Entra na **R1** (só lê o histórico, que já existe na T10).
4. **Interruptor Foco/Completo** (aprovado em 2026-10-22, entra na **R1** com a janela da demanda): configuração que muda o quanto aparece, sem criar telas novas. Detalhes na seção 5b.
5. **Limite de "Fazendo":** aviso suave quando houver mais de 3 demandas em Fazendo ("Você tem 5 em andamento. Escolha uma como Agora."). Entra na **R2**.

## 5b. Interruptor Foco/Completo (aprovado)

| | **Foco** | **Completo** |
|---|---|---|
| Retomar | Só a demanda "Agora" e a próxima subtarefa | Lista de Fazendo e Feito hoje |
| Barra lateral | Recolhida | Aberta |
| Demandas | Até 5 itens à vista | Todas as visões e metadados |
| Janela da demanda | Próxima ação e subtarefas; o resto recolhido | Tudo aberto |

- Fica no cabeçalho, ao lado do tema, com atalho de teclado. O `impeccable` traz 3 propostas da aparência antes de construir.
- Aplicado antes da primeira pintura, como o tema (atributo `data-mode` no `<html>`).
- R1: salvo no navegador. R4: tabela `user_settings` por pessoa.
- É só apresentação: mesma tela, partes recolhidas. Testes cobrem os dois modos.
- Depende de "Agora" e da janela da demanda. O Foco enriquecido com estimativas fica na R2.

## 6. Método de trabalho (B): como construímos

Já pratico parte disso. Aqui fica como regra escrita.

1. **Cada resposta abre com a próxima ação**, seguida do estado ("passo 3 de 5") e fecha com **uma** próxima ação.
2. **Uma tarefa em andamento por vez** (limite de trabalho em progresso = 1).
3. **Tarefa = no máximo 5 passos numerados**, cada um com critério de aceite e **estimativa concreta** do tempo de quem executa.
4. **Fatias pequenas:** um commit por passo, teste primeiro, log do teste como prova.
5. **Ganho visível:** ao fim de cada fatia, dizer o que passou a funcionar e como ver.
6. **Diário de sessão:** `docs/STATUS.md` tem a seção **Próxima ação**, que abre qualquer sessão nova sem depender de memória.
7. **Decisões do Pedro em lote**, numeradas, com minha recomendação ao lado, para responder com "ok" ou um número.
8. **Sem tangente:** ideia fora da tarefa vai para a seção de ideias do `STATUS.md`, não para a conversa.

## 7. Riscos

| Risco | Resposta |
|---|---|
| Excesso de regras vira ruído | Máximo de 10 regras de produto; revisar no `impeccable` a cada release |
| Estimativa errada desmotiva | Mostrar como "estimado", nunca como cobrança |
| "Feito hoje" depende do histórico (T10) | Até lá, derivar de `updated_at` das demandas em Feito |
