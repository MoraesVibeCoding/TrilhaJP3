import { expect, test } from "vitest";
import { groupByProject } from "./project-groups";
import type { DemandRow } from "./demands-view";

const projects = [
  { id: "p1", name: "Site" },
  { id: "p2", name: "App" },
  { id: "p3", name: "Vazio" },
];

const row = (over: Partial<DemandRow>): DemandRow => ({
  id: "x",
  title: "T",
  projectId: "p1",
  projectName: "Site",
  state: "Fazendo",
  priority: "Média",
  lastActivityAt: "2026-10-20T10:00:00",
  nextSubtask: null,
  subtasksDone: 0,
  subtasksTotal: 0,
  ...over,
});

const rows = [
  row({ id: "a", state: "A fazer" }),
  row({ id: "b", state: "Fazendo" }),
  row({ id: "c", state: "Feito" }),
  row({ id: "d", projectId: "p2", projectName: "App", state: "Fazendo" }),
];

test("groups follow the project order and count each state", () => {
  const g = groupByProject(rows, rows, projects, false);
  expect(g.map((x) => x.name)).toEqual(["Site", "App"]);
  expect(g[0]!.counts).toEqual({ "A fazer": 1, Fazendo: 1, Feito: 1 });
  expect(g[0]!.done).toBe(1);
  expect(g[0]!.total).toBe(3);
});

test("items keep the order they came in", () => {
  const g = groupByProject([rows[1]!, rows[0]!], rows, projects, false);
  expect(g[0]!.items.map((r) => r.id)).toEqual(["b", "a"]);
});

test("a project with no demands only shows when asked", () => {
  expect(groupByProject(rows, rows, projects, false)).toHaveLength(2);
  const all = groupByProject(rows, rows, projects, true);
  expect(all.map((x) => x.name)).toEqual(["Site", "App", "Vazio"]);
  expect(all[2]!.total).toBe(0);
});

test("counts come from countRows, items from the visible rows", () => {
  const g = groupByProject([rows[1]!], rows, projects, false);
  expect(g[0]!.total).toBe(3);
  expect(g[0]!.items).toHaveLength(1);
});
