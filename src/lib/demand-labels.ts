import type { DemandState, Priority } from "./demo-data";

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
