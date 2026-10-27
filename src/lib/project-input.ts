import { z } from "zod";

// Valores do banco e os rótulos em pt-BR (a migração 20261027120000_projects tem as mesmas listas).
export const PROJECT_STATUSES = {
  idea: "Ideia",
  in_progress: "Em andamento",
  paused: "Pausado",
  done: "Concluído",
} as const;
export const PROJECT_PRIORITIES = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
} as const;

export type ProjectStatusValue = keyof typeof PROJECT_STATUSES;
export type ProjectPriorityValue = keyof typeof PROJECT_PRIORITIES;
export type ProjectField =
  "name" | "description" | "status" | "priority" | "link";

// Campo opcional: vazio vira null, como o banco guarda.
const optional = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || null);

// Validação na borda (docs/SPEC.md 4.3), com os mesmos limites das restrições do banco.
const schema = z.object({
  name: z
    .string("Dê um nome ao projeto.")
    .trim()
    .min(1, "Dê um nome ao projeto.")
    .max(120, "Use no máximo 120 caracteres."),
  description: optional(2000, "Use no máximo 2.000 caracteres."),
  status: z.enum(
    Object.keys(PROJECT_STATUSES) as [ProjectStatusValue],
    "Escolha um estado da lista.",
  ),
  priority: z.enum(
    Object.keys(PROJECT_PRIORITIES) as [ProjectPriorityValue],
    "Escolha uma prioridade da lista.",
  ),
  link: optional(2000, "Use no máximo 2.000 caracteres.").refine(
    (value) => value === null || /^https:\/\/\S+$/.test(value),
    "Use um endereço que comece com https://.",
  ),
});

export type ProjectInput = z.infer<typeof schema>;

export function parseProject(
  form: FormData,
):
  | { ok: true; data: ProjectInput }
  | { ok: false; errors: Partial<Record<ProjectField, string>> } {
  const result = schema.safeParse({
    name: form.get("name"),
    description: form.get("description") ?? "",
    status: form.get("status"),
    priority: form.get("priority"),
    link: form.get("link") ?? "",
  });
  if (result.success) return { ok: true, data: result.data };
  const errors: Partial<Record<ProjectField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ProjectField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}
