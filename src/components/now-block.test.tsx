import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NowBlock } from "./now-block";
import type { ResumeItem } from "@/lib/resume";

afterEach(cleanup);

const item = (over: Partial<ResumeItem> = {}): ResumeItem => ({
  id: "a",
  title: "Revisar textos",
  projectName: "Site institucional",
  lastActivityAt: "2026-10-21T17:00:00",
  nextSubtask: "Contato",
  nextStepNumber: 2,
  subtasksDone: 1,
  subtasksTotal: 3,
  ...over,
});

const setup = (over: Partial<ResumeItem> = {}, suggested = false) => {
  const onConclude = vi.fn();
  const onOpen = vi.fn();
  render(
    <NowBlock
      item={item(over)}
      suggested={suggested}
      onConclude={onConclude}
      onOpen={onOpen}
    />,
  );
  return { onConclude, onOpen };
};

test("leads with Agora, the demand and the next step", () => {
  setup();
  expect(screen.getByRole("heading", { name: "Agora" })).toBeDefined();
  expect(screen.getByText("Site institucional")).toBeDefined();
  expect(screen.getByText("Contato")).toBeDefined();
  expect(screen.getByText("Passo 2 de 3")).toBeDefined();
});

test("Concluir passo and the title call back", () => {
  const { onConclude, onOpen } = setup();
  fireEvent.click(screen.getByRole("button", { name: "Concluir passo" }));
  expect(onConclude).toHaveBeenCalledWith("a");
  fireEvent.click(screen.getByRole("button", { name: "Revisar textos" }));
  expect(onOpen).toHaveBeenCalledWith("a");
});

test("with no steps at all it says Sem subtarefas and has no button", () => {
  setup({
    nextSubtask: null,
    nextStepNumber: null,
    subtasksDone: 0,
    subtasksTotal: 0,
  });
  expect(screen.getByText("Sem subtarefas")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Concluir passo" })).toBeNull();
});

test("with every step done it says Sem passos pendentes and has no button", () => {
  setup({
    nextSubtask: null,
    nextStepNumber: null,
    subtasksDone: 3,
    subtasksTotal: 3,
  });
  expect(screen.getByText("Sem passos pendentes")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Concluir passo" })).toBeNull();
});

test("says when it is only a suggestion", () => {
  setup({}, true);
  expect(
    screen.getByText("Sugestão: a mais recente em andamento."),
  ).toBeDefined();
});

test("shows step progress: one mark per step, finished ones filled", () => {
  const { container } = render(
    <NowBlock
      item={item()}
      suggested={false}
      onConclude={() => {}}
      onOpen={() => {}}
    />,
  );
  expect(container.querySelectorAll("[data-filled]")).toHaveLength(3);
  expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(1);
});
