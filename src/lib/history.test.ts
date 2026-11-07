import { expect, test } from "vitest";
import { describeEvent } from "./history";

const now = new Date(2026, 10, 5, 10, 0);
const field = (name: string, from?: unknown, to?: unknown) =>
  describeEvent("field_changed", { field: name, from, to }, now);

test("campos da demanda: antes e depois, com os rótulos da tela", () => {
  expect(field("title", "Revisar", "Revisar textos")).toBe(
    "Título: Revisar → Revisar textos",
  );
  expect(field("state", "todo", "doing")).toBe("Estado: A fazer → Fazendo");
  expect(field("priority", "medium", "high")).toBe("Prioridade: Média → Alta");
  expect(field("project", "Site", "Loja")).toBe("Projeto: Site → Loja");
  expect(field("project", null, "Loja")).toBe("Projeto: sem projeto → Loja");
});

test("prazo vazio diz sem prazo; o ano só aparece quando não é o atual", () => {
  expect(field("due_date", null, "2026-11-07")).toBe(
    "Prazo: sem prazo → 7 de nov.",
  );
  expect(field("due_date", "2026-11-07", null)).toBe(
    "Prazo: 7 de nov. → sem prazo",
  );
  expect(field("due_date", "2026-11-07", "2027-01-10")).toBe(
    "Prazo: 7 de nov. → 10 de jan. de 2027",
  );
});

test("descrição e Agora não mostram valores", () => {
  expect(field("description")).toBe("Mudou a descrição");
  expect(field("is_now", false, true)).toBe("Marcou como Agora");
  expect(field("is_now", true, false)).toBe("Tirou de Agora");
});

test("demanda, subtarefas, etiquetas e comentários", () => {
  const cases: [string, Record<string, unknown>, string][] = [
    ["task_created", {}, "Criou a demanda"],
    ["task_archived", {}, "Arquivou a demanda"],
    ["task_restored", {}, "Restaurou a demanda"],
    ["subtask_added", { title: "Contato" }, "Criou a subtarefa Contato"],
    [
      "subtask_renamed",
      { from: "Contato", to: "Rodapé" },
      "Renomeou a subtarefa Contato para Rodapé",
    ],
    ["subtask_done", { title: "Contato" }, "Concluiu a subtarefa Contato"],
    ["subtask_reopened", { title: "Contato" }, "Reabriu a subtarefa Contato"],
    ["subtask_removed", { title: "Contato" }, "Removeu a subtarefa Contato"],
    ["label_applied", { name: "Bug" }, "Aplicou a etiqueta Bug"],
    ["label_removed", { name: "Bug" }, "Tirou a etiqueta Bug"],
    ["comment_added", {}, "Comentou"],
    ["comment_removed", {}, "Apagou um comentário"],
  ];
  for (const [type, changes, text] of cases)
    expect(describeEvent(type, changes, now)).toBe(text);
});

test("tipo ou campo desconhecido não quebra a tela", () => {
  expect(describeEvent("algo_novo", {}, now)).toBe("Alterou a demanda");
  expect(field("cor", "a", "b")).toBe("Alterou a demanda");
});
