export const DEMAND_STATES = ["A fazer", "Fazendo", "Feito"] as const;
export const PRIORITIES = ["Alta", "Média", "Baixa"] as const;
export type DemandState = (typeof DEMAND_STATES)[number];
export type Priority = (typeof PRIORITIES)[number];

// Uma demanda no formato que as telas usam (rótulos em pt-BR); vem de toDemand em demands.ts.
export type Demand = {
  id: string;
  projectId: string;
  title: string;
  state: DemandState;
  priority: Priority;
  lastActivityAt: string;
  subtasks: readonly { id: string; title: string; done: boolean }[];
  comments: readonly { author: string; at: string; text: string }[];
  attachments: readonly { name: string }[];
  history: readonly { at: string; text: string }[];
  isNow?: boolean;
  doneAt?: string;
  description?: string;
  // data sem hora, como o banco guarda (AAAA-MM-DD)
  dueDate?: string;
};

// Valores do banco (migração 20261027140000_tasks) e os rótulos que as telas mostram.
export const STATE_LABELS: Record<string, DemandState> = {
  todo: "A fazer",
  doing: "Fazendo",
  done: "Feito",
};
export const PRIORITY_LABELS: Record<string, Priority> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const valueOf = (labels: Record<string, string>) => (label: string) =>
  Object.keys(labels).find((key) => labels[key] === label);
export const stateValue = valueOf(STATE_LABELS);
export const priorityValue = valueOf(PRIORITY_LABELS);

// Prazo é data sem hora (AAAA-MM-DD): formata em UTC para não voltar um dia no fuso de São Paulo.
export function formatDueDate(value: string, now: Date) {
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...(date.getUTCFullYear() !== now.getFullYear() && { year: "numeric" }),
  }).format(date);
}
