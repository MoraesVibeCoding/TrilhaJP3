import { expect, test } from "vitest";
import {
  buildRows,
  filterRows,
  sortRows,
  type DemandInput,
} from "./demands-view";

const projects = [
  { id: "p1", name: "Site" },
  { id: "p2", name: "App" },
];

const demand = (over: Partial<DemandInput>): DemandInput => ({
  id: "x",
  projectId: "p1",
  title: "T",
  state: "Fazendo",
  priority: "Média",
  lastActivityAt: "2026-10-20T10:00:00",
  subtasks: [],
  ...over,
});

const input: DemandInput[] = [
  demand({
    id: "a",
    title: "Banner",
    state: "A fazer",
    priority: "Baixa",
    lastActivityAt: "2026-10-18T10:00:00",
  }),
  demand({
    id: "b",
    title: "Checkout",
    projectId: "p2",
    priority: "Alta",
    lastActivityAt: "2026-10-21T10:00:00",
  }),
  demand({
    id: "c",
    title: "Agenda",
    projectId: "p2",
    state: "Feito",
    priority: "Alta",
    lastActivityAt: "2026-10-22T10:00:00",
  }),
  demand({
    id: "d",
    title: "Contato",
    priority: "Média",
    lastActivityAt: "2026-10-19T10:00:00",
  }),
];

const rows = buildRows(input, projects);

test("rows carry the project name and subtask progress", () => {
  const [r] = buildRows(
    [
      demand({
        id: "z",
        subtasks: [
          { id: "1", title: "1", done: true },
          { id: "2", title: "2", done: false },
        ],
      }),
    ],
    projects,
  );
  expect(r.projectName).toBe("Site");
  expect(r.nextSubtask).toBe("2");
  expect(r.subtasksDone).toBe(1);
  expect(r.subtasksTotal).toBe(2);
});

test("an unknown project becomes an empty name", () => {
  expect(
    buildRows([demand({ projectId: "zz" })], projects)[0].projectName,
  ).toBe("");
});

test("empty filters keep everything", () => {
  expect(
    filterRows(rows, { project: "", state: "", priority: "" }),
  ).toHaveLength(4);
});

test("filters by project, state and priority, combined with AND", () => {
  expect(
    filterRows(rows, { project: "p2", state: "", priority: "" }).map(
      (r) => r.id,
    ),
  ).toEqual(["b", "c"]);
  expect(
    filterRows(rows, { project: "", state: "Feito", priority: "" }).map(
      (r) => r.id,
    ),
  ).toEqual(["c"]);
  expect(
    filterRows(rows, { project: "p2", state: "", priority: "Alta" }).map(
      (r) => r.id,
    ),
  ).toEqual(["b", "c"]);
  expect(
    filterRows(rows, { project: "p1", state: "", priority: "Alta" }),
  ).toEqual([]);
});

test("sorts by priority with Alta first; on a tie, work to do comes before Feito", () => {
  const ids = sortRows(rows, { key: "priority", dir: "desc" }).map((r) => r.id);
  expect(ids).toEqual(["b", "c", "d", "a"]);
});

test("a finished demand never leads a priority tie, even with newer activity", () => {
  const list = buildRows(
    [
      demand({
        id: "f",
        state: "Feito",
        priority: "Alta",
        lastActivityAt: "2026-10-22T10:00:00",
      }),
      demand({
        id: "t",
        state: "A fazer",
        priority: "Alta",
        lastActivityAt: "2026-10-01T10:00:00",
      }),
    ],
    projects,
  );
  expect(sortRows(list, { key: "priority", dir: "desc" })[0].id).toBe("t");
});

test("sorting ascending reverses the primary order", () => {
  const ids = sortRows(rows, { key: "priority", dir: "asc" }).map((r) => r.id);
  expect(ids).toEqual(["a", "d", "b", "c"]);
});

test("sorts by title in pt-BR, by state in workflow order and by activity", () => {
  expect(
    sortRows(rows, { key: "title", dir: "asc" }).map((r) => r.title),
  ).toEqual(["Agenda", "Banner", "Checkout", "Contato"]);
  expect(
    sortRows(rows, { key: "state", dir: "asc" }).map((r) => r.state),
  ).toEqual(["A fazer", "Fazendo", "Fazendo", "Feito"]);
  expect(
    sortRows(rows, { key: "activity", dir: "desc" }).map((r) => r.id),
  ).toEqual(["c", "b", "d", "a"]);
});

test("sorting does not mutate the input", () => {
  const copy = [...rows];
  sortRows(rows, { key: "title", dir: "asc" });
  expect(rows).toEqual(copy);
});
