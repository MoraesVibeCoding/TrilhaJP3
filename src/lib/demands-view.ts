import type { DemandState, Priority } from "./demand-labels";

type Subtask = { title: string; done: boolean };

export type DemandInput = {
  id: string;
  projectId: string;
  title: string;
  state: DemandState;
  priority: Priority;
  lastActivityAt: string;
  subtasks: readonly Subtask[];
};

export type DemandRow = {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  state: DemandState;
  priority: Priority;
  lastActivityAt: string;
  nextSubtask: string | null;
  subtasksDone: number;
  subtasksTotal: number;
};

export type Filters = {
  project: string;
  state: DemandState | "";
  priority: Priority | "";
};
export type SortKey = "title" | "project" | "state" | "priority" | "activity";
export type Sort = { key: SortKey; dir: "asc" | "desc" };

const PRIORITY_RANK: Record<Priority, number> = { Alta: 3, Média: 2, Baixa: 1 };
const STATE_RANK: Record<DemandState, number> = {
  "A fazer": 0,
  Fazendo: 1,
  Feito: 2,
};

export function buildRows(
  demands: readonly DemandInput[],
  projects: readonly { id: string; name: string }[],
): DemandRow[] {
  const names = new Map(projects.map((p) => [p.id, p.name]));
  return demands.map((d) => ({
    id: d.id,
    title: d.title,
    projectId: d.projectId,
    projectName: names.get(d.projectId) ?? "",
    state: d.state,
    priority: d.priority,
    lastActivityAt: d.lastActivityAt,
    nextSubtask: d.subtasks.find((s) => !s.done)?.title ?? null,
    subtasksDone: d.subtasks.filter((s) => s.done).length,
    subtasksTotal: d.subtasks.length,
  }));
}

export function filterRows(
  rows: readonly DemandRow[],
  f: Filters,
): DemandRow[] {
  return rows.filter(
    (r) =>
      (!f.project || r.projectId === f.project) &&
      (!f.state || r.state === f.state) &&
      (!f.priority || r.priority === f.priority),
  );
}

const primary = (a: DemandRow, b: DemandRow, key: SortKey): number => {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title, "pt-BR");
    case "project":
      return a.projectName.localeCompare(b.projectName, "pt-BR");
    case "state":
      return STATE_RANK[a.state] - STATE_RANK[b.state];
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "activity":
      return a.lastActivityAt.localeCompare(b.lastActivityAt);
  }
};

// O que ainda pede ação vem antes do concluído: a primeira linha é sempre uma ação.
const ACTION_RANK: Record<DemandState, number> = {
  Fazendo: 0,
  "A fazer": 1,
  Feito: 2,
};

// Empate: ação antes de Feito (na ordem por prioridade), atividade mais recente, depois título.
export function sortRows(rows: readonly DemandRow[], sort: Sort): DemandRow[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  return rows.toSorted(
    (a, b) =>
      sign * primary(a, b, sort.key) ||
      (sort.key === "priority"
        ? ACTION_RANK[a.state] - ACTION_RANK[b.state]
        : 0) ||
      b.lastActivityAt.localeCompare(a.lastActivityAt) ||
      a.title.localeCompare(b.title, "pt-BR"),
  );
}
