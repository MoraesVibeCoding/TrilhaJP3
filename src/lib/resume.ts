import type { DemandState } from "./demand-labels";

type Subtask = { id: string; title: string; done: boolean };

export type ResumeDemand = {
  id: string;
  projectId: string;
  title: string;
  state: DemandState;
  lastActivityAt: string;
  subtasks: readonly Subtask[];
  isNow?: boolean;
  doneAt?: string;
};

export type ResumeItem = {
  id: string;
  title: string;
  projectName: string;
  lastActivityAt: string;
  nextSubtask: string | null;
  nextStepNumber: number | null;
  subtasksDone: number;
  subtasksTotal: number;
};

const byActivityDesc = (a: ResumeDemand, b: ResumeDemand) =>
  b.lastActivityAt.localeCompare(a.lastActivityAt);

const nameMap = (projects: readonly { id: string; name: string }[]) =>
  new Map(projects.map((p) => [p.id, p.name]));

function toItem(d: ResumeDemand, names: Map<string, string>): ResumeItem {
  const next = d.subtasks.findIndex((s) => !s.done);
  return {
    id: d.id,
    title: d.title,
    projectName: names.get(d.projectId) ?? "",
    lastActivityAt: d.lastActivityAt,
    nextSubtask: next >= 0 ? d.subtasks[next].title : null,
    nextStepNumber: next >= 0 ? next + 1 : null,
    subtasksDone: d.subtasks.filter((s) => s.done).length,
    subtasksTotal: d.subtasks.length,
  };
}

export function selectResume(
  demands: readonly ResumeDemand[],
  projects: readonly { id: string; name: string }[],
): ResumeItem[] {
  const names = nameMap(projects);
  return demands
    .filter((d) => d.state === "Fazendo")
    .toSorted(byActivityDesc)
    .map((d) => toItem(d, names));
}

// Agora: a demanda marcada como foco; sem marca, sugere a mais recente em andamento.
export function selectNow(
  demands: readonly ResumeDemand[],
  projects: readonly { id: string; name: string }[],
): { item: ResumeItem; suggested: boolean } | null {
  const marked = demands
    .filter((d) => d.isNow && d.state !== "Feito")
    .toSorted(byActivityDesc)[0];
  if (marked)
    return { item: toItem(marked, nameMap(projects)), suggested: false };
  const [first] = selectResume(demands, projects);
  return first ? { item: first, suggested: true } : null;
}

export function selectDoneToday(
  demands: readonly ResumeDemand[],
  projects: readonly { id: string; name: string }[],
  now: Date,
): ResumeItem[] {
  const names = nameMap(projects);
  const today = startOfDay(now);
  return demands
    .filter(
      (d) =>
        d.state === "Feito" &&
        d.doneAt !== undefined &&
        // >=: depois do dia de referência também é hoje, como em formatActivity
        startOfDay(new Date(d.doneAt)) >= today,
    )
    .toSorted((a, b) => b.doneAt!.localeCompare(a.doneAt!))
    .map((d) => ({ ...toItem(d, names), lastActivityAt: d.doneAt! }));
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export function formatActivity(iso: string, now: Date): string {
  const when = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(when)) / 86_400_000);
  if (days <= 0) return `hoje, ${when.getHours()}h`;
  if (days === 1) return `ontem, ${when.getHours()}h`;
  return `há ${days} dias`;
}
