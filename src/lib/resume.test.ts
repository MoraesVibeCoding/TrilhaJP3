import { expect, test } from "vitest";
import { formatActivity, selectResume } from "./resume";

const projects = [
  { id: "p1", name: "Site" },
  { id: "p2", name: "App" },
];

const base = {
  priority: "Média" as const,
  subtasks: [],
};

test("keeps only demands being done, newest activity first", () => {
  const items = selectResume(
    [
      {
        ...base,
        id: "a",
        projectId: "p1",
        title: "A",
        state: "Fazendo",
        lastActivityAt: "2026-10-20T10:00:00",
      },
      {
        ...base,
        id: "b",
        projectId: "p2",
        title: "B",
        state: "A fazer",
        lastActivityAt: "2026-10-22T10:00:00",
      },
      {
        ...base,
        id: "c",
        projectId: "p2",
        title: "C",
        state: "Fazendo",
        lastActivityAt: "2026-10-21T10:00:00",
      },
      {
        ...base,
        id: "d",
        projectId: "p1",
        title: "D",
        state: "Feito",
        lastActivityAt: "2026-10-22T11:00:00",
      },
    ],
    projects,
  );
  expect(items.map((i) => i.id)).toEqual(["c", "a"]);
  expect(items[0].projectName).toBe("App");
});

test("points at the first pending subtask and counts progress", () => {
  const [item] = selectResume(
    [
      {
        ...base,
        id: "a",
        projectId: "p1",
        title: "A",
        state: "Fazendo",
        lastActivityAt: "2026-10-20T10:00:00",
        subtasks: [
          { id: "Home", title: "Home", done: true },
          { id: "Contato", title: "Contato", done: false },
          { id: "Rodapé", title: "Rodapé", done: false },
        ],
      },
    ],
    projects,
  );
  expect(item.nextSubtask).toBe("Contato");
  expect(item.nextStepNumber).toBe(2);
  expect(item.subtasksDone).toBe(1);
  expect(item.subtasksTotal).toBe(3);
});

test("has no next subtask when there are none or all are done", () => {
  const [none, all] = selectResume(
    [
      {
        ...base,
        id: "a",
        projectId: "p1",
        title: "A",
        state: "Fazendo",
        lastActivityAt: "2026-10-22T10:00:00",
      },
      {
        ...base,
        id: "b",
        projectId: "p1",
        title: "B",
        state: "Fazendo",
        lastActivityAt: "2026-10-21T10:00:00",
        subtasks: [{ id: "X", title: "X", done: true }],
      },
    ],
    projects,
  );
  expect(none.nextSubtask).toBeNull();
  expect(all.nextSubtask).toBeNull();
});

test("falls back to an empty project name for an unknown project", () => {
  const [item] = selectResume(
    [
      {
        ...base,
        id: "a",
        projectId: "zz",
        title: "A",
        state: "Fazendo",
        lastActivityAt: "2026-10-22T10:00:00",
      },
    ],
    projects,
  );
  expect(item.projectName).toBe("");
});

const now = new Date(2026, 9, 22, 15, 0);

test("formats today, yesterday and older activity in pt-BR", () => {
  expect(formatActivity(new Date(2026, 9, 22, 9, 5).toISOString(), now)).toBe(
    "hoje, 9h",
  );
  expect(formatActivity(new Date(2026, 9, 21, 17, 30).toISOString(), now)).toBe(
    "ontem, 17h",
  );
  expect(formatActivity(new Date(2026, 9, 19, 8, 0).toISOString(), now)).toBe(
    "há 3 dias",
  );
});

import { selectDoneToday, selectNow } from "./resume";

const demand = (over: Record<string, unknown>) => ({
  id: "x",
  projectId: "p1",
  title: "T",
  state: "Fazendo" as const,
  lastActivityAt: "2026-10-20T10:00:00",
  subtasks: [],
  ...over,
});

test("Agora is the demand marked as now", () => {
  const result = selectNow(
    [
      demand({ id: "a", lastActivityAt: "2026-10-22T09:00:00" }),
      demand({ id: "b", isNow: true, lastActivityAt: "2026-10-19T09:00:00" }),
    ],
    projects,
  );
  expect(result?.item.id).toBe("b");
  expect(result?.suggested).toBe(false);
});

test("with no mark, suggests the most recent one in progress", () => {
  const result = selectNow(
    [
      demand({ id: "a", lastActivityAt: "2026-10-18T09:00:00" }),
      demand({ id: "b", lastActivityAt: "2026-10-21T09:00:00" }),
    ],
    projects,
  );
  expect(result?.item.id).toBe("b");
  expect(result?.suggested).toBe(true);
});

test("a finished demand is never Agora, even if marked", () => {
  const result = selectNow(
    [demand({ id: "a", isNow: true, state: "Feito" })],
    projects,
  );
  expect(result).toBeNull();
});

test("nothing to do means no Agora", () => {
  expect(selectNow([], projects)).toBeNull();
});

test("Feito hoje keeps only demands finished today, newest first", () => {
  const items = selectDoneToday(
    [
      demand({ id: "a", state: "Feito", doneAt: "2026-10-22T09:00:00" }),
      demand({ id: "b", state: "Feito", doneAt: "2026-10-22T14:00:00" }),
      demand({ id: "c", state: "Feito", doneAt: "2026-10-21T23:59:00" }),
      demand({ id: "d", state: "Fazendo", doneAt: "2026-10-22T10:00:00" }),
      demand({ id: "e", state: "Feito" }),
    ],
    projects,
    new Date(2026, 9, 22, 15, 0),
  );
  expect(items.map((i) => i.id)).toEqual(["b", "a"]);
});

test("Feito hoje also keeps what was finished after the reference day, like formatActivity's hoje", () => {
  // a demonstração fixa "hoje" em 22/10; mover para Feito grava a data real, que vem depois
  const now = new Date(2026, 9, 22, 15, 0);
  const items = selectDoneToday(
    [demand({ id: "real", state: "Feito", doneAt: "2026-10-26T10:00:00" })],
    projects,
    now,
  );
  expect(items.map((i) => i.id)).toEqual(["real"]);
  expect(formatActivity("2026-10-26T10:00:00", now)).toBe("hoje, 10h");
});
