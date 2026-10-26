import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { ResumeList } from "./resume-list";
import type { ResumeItem } from "@/lib/resume";

afterEach(cleanup);

const now = new Date(2026, 9, 22, 15, 0);
const item = (over: Partial<ResumeItem> = {}): ResumeItem => ({
  id: "a",
  title: "Revisar textos",
  projectName: "Site institucional",
  lastActivityAt: new Date(2026, 9, 21, 17, 0).toISOString(),
  nextSubtask: "Contato",
  nextStepNumber: 2,
  subtasksDone: 1,
  subtasksTotal: 3,
  ...over,
});

test("shows title, project, last activity and next subtask", () => {
  render(<ResumeList items={[item()]} now={now} onOpen={() => {}} />);
  const row = within(
    screen.getByRole("list", { name: "Em andamento" }),
  ).getAllByRole("listitem")[0];
  expect(within(row).getByText("Revisar textos")).toBeDefined();
  expect(within(row).getByText("Site institucional")).toBeDefined();
  expect(within(row).getByText("ontem, 17h")).toBeDefined();
  expect(within(row).getByText("Próxima: Contato")).toBeDefined();
  expect(within(row).getByText("1 de 3 subtarefas")).toBeDefined();
});

test("says so when there is no pending subtask", () => {
  render(
    <ResumeList
      items={[item({ nextSubtask: null, subtasksDone: 0, subtasksTotal: 0 })]}
      now={now}
      onOpen={() => {}}
    />,
  );
  expect(screen.getByText("Sem subtarefas")).toBeDefined();
  expect(screen.queryByText(/\d de \d subtarefas/)).toBeNull();
});

test("empty state points to the full list of demands", () => {
  render(<ResumeList items={[]} now={now} onOpen={() => {}} />);
  expect(screen.getByText("Nada em andamento agora.")).toBeDefined();
  expect(
    screen
      .getByRole("link", { name: "Ver todas as demandas" })
      .getAttribute("href"),
  ).toBe("/demandas");
  expect(screen.queryByRole("list", { name: "Em andamento" })).toBeNull();
});

test("clicking a title asks to open that demand", () => {
  const onOpen = vi.fn();
  render(<ResumeList items={[item()]} now={now} onOpen={onOpen} />);
  fireEvent.click(screen.getByRole("button", { name: "Revisar textos" }));
  expect(onOpen).toHaveBeenCalledWith("a");
});

test("when every subtask is done it says there is nothing pending, not that there are none", () => {
  render(
    <ResumeList
      items={[item({ nextSubtask: null, subtasksDone: 2, subtasksTotal: 2 })]}
      now={now}
      onOpen={() => {}}
    />,
  );
  expect(screen.getByText("Sem subtarefas pendentes")).toBeDefined();
});
