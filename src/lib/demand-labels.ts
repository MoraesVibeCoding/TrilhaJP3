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

export const stateValue = (label: string) =>
  Object.keys(STATE_LABELS).find((key) => STATE_LABELS[key] === label);
