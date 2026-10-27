import { z } from "zod";
import { PRIORITY_LABELS } from "./demand-labels";

export type DemandField = "title" | "description" | "priority" | "due_date";
type PriorityValue = "high" | "medium" | "low";

// Data real no formato do campo <input type="date">: 2026-02-30 não passa.
const isDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

// Validação na borda, com os mesmos limites das restrições da tabela tasks.
const schema = z.object({
  title: z
    .string("Dê um título à demanda.")
    .trim()
    .min(1, "Dê um título à demanda.")
    .max(200, "Use no máximo 200 caracteres."),
  description: z
    .string()
    .trim()
    .max(5000, "Use no máximo 5.000 caracteres.")
    .transform((value) => value || null),
  priority: z.enum(
    Object.keys(PRIORITY_LABELS) as [PriorityValue],
    "Escolha uma prioridade da lista.",
  ),
  due_date: z
    .string()
    .refine((value) => value === "" || isDate(value), "Use uma data válida.")
    .transform((value) => value || null),
});

export type DemandInput = z.infer<typeof schema>;

export function parseDemand(
  form: FormData,
):
  | { ok: true; data: DemandInput }
  | { ok: false; errors: Partial<Record<DemandField, string>> } {
  const result = schema.safeParse({
    title: form.get("title"),
    description: form.get("description") ?? "",
    priority: form.get("priority"),
    due_date: form.get("due_date") ?? "",
  });
  if (result.success) return { ok: true, data: result.data };
  const errors: Partial<Record<DemandField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as DemandField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}
