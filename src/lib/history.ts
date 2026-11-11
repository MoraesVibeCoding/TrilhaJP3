// T10: o texto de cada evento do histórico (tasks/t10-spec.md, seção 2), montado a partir de type e changes.
import { formatDueDate, PRIORITY_LABELS, STATE_LABELS } from "./demand-labels";

type Changes = Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" ? value : "");

const FIELDS: Record<string, [string, (value: unknown, now: Date) => string]> =
  {
    title: ["Título", text],
    state: ["Estado", (v) => STATE_LABELS[text(v)] ?? text(v)],
    priority: ["Prioridade", (v) => PRIORITY_LABELS[text(v)] ?? text(v)],
    project: ["Projeto", (v) => text(v) || "sem projeto"],
    due_date: [
      "Prazo",
      (v, now) => (v ? formatDueDate(text(v), now) : "sem prazo"),
    ],
  };

const SIMPLE: Record<string, (c: Changes) => string> = {
  task_created: () => "Criou a demanda",
  task_archived: () => "Arquivou a demanda",
  task_restored: () => "Restaurou a demanda",
  subtask_added: (c) => `Criou a subtarefa ${text(c.title)}`,
  subtask_renamed: (c) =>
    `Renomeou a subtarefa ${text(c.from)} para ${text(c.to)}`,
  subtask_done: (c) => `Concluiu a subtarefa ${text(c.title)}`,
  subtask_reopened: (c) => `Reabriu a subtarefa ${text(c.title)}`,
  subtask_removed: (c) => `Removeu a subtarefa ${text(c.title)}`,
  label_applied: (c) => `Aplicou a etiqueta ${text(c.name)}`,
  label_removed: (c) => `Tirou a etiqueta ${text(c.name)}`,
  comment_added: () => "Comentou",
  comment_removed: () => "Apagou um comentário",
  attachment_added: (c) => `Anexou ${text(c.name)}`,
  attachment_removed: (c) => `Removeu o anexo ${text(c.name)}`,
};

// Tipo ou campo que a tela ainda não conhece vira um texto genérico, sem quebrar a lista.
const UNKNOWN = "Alterou a demanda";

export function describeEvent(type: string, changes: Changes, now: Date) {
  if (type !== "field_changed") return SIMPLE[type]?.(changes) ?? UNKNOWN;
  const field = text(changes.field);
  if (field === "description") return "Mudou a descrição";
  if (field === "is_now")
    return changes.to ? "Marcou como Agora" : "Tirou de Agora";
  const known = FIELDS[field];
  if (!known) return UNKNOWN;
  const [label, show] = known;
  return `${label}: ${show(changes.from, now)} → ${show(changes.to, now)}`;
}
