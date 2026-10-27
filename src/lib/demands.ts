// Leitura das demandas da empresa (a RLS da T5 só devolve as dela), no formato que as telas já usam.
import { getCurrentUser } from "@/lib/auth";
import { PRIORITY_LABELS, STATE_LABELS } from "@/lib/demand-labels";
import type { Demand } from "@/lib/demand-labels";
import { createClient } from "@/lib/supabase/server";

type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  state: string;
  priority: string;
  is_now: boolean;
  done_at: string | null;
  updated_at: string;
  parent_task_id: string | null;
  created_at: string;
  description: string | null;
  due_date: string | null;
};

// Comentários, anexos e histórico chegam na T9, T11 e T10: por ora, listas vazias.
export function toDemand(
  row: TaskRow,
  subtasks: Demand["subtasks"] = [],
): Demand {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    state: STATE_LABELS[row.state],
    priority: PRIORITY_LABELS[row.priority],
    isNow: row.is_now,
    lastActivityAt: row.updated_at,
    ...(row.done_at ? { doneAt: row.done_at } : {}),
    ...(row.description ? { description: row.description } : {}),
    ...(row.due_date ? { dueDate: row.due_date } : {}),
    subtasks,
    comments: [],
    attachments: [],
    history: [],
  };
}

export async function listDemands(): Promise<Demand[]> {
  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, project_id, title, state, priority, is_now, done_at, updated_at, parent_task_id, created_at, description, due_date",
    )
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const rows = data as TaskRow[];
  // Subtarefa é a demanda filha (parent_task_id); os passos seguem a ordem de criação.
  const steps = rows
    .filter((r) => r.parent_task_id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return rows
    .filter((r) => !r.parent_task_id)
    .map((r) =>
      toDemand(
        r,
        steps
          .filter((s) => s.parent_task_id === r.id)
          .map((s) => ({ title: s.title, done: s.state === "done" })),
      ),
    );
}
