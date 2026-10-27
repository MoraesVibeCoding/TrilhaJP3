// Leitura das demandas da empresa (a RLS da T5 só devolve as dela), no formato que as telas já usam.
import { getCurrentUser } from "@/lib/auth";
import type { DemandState, DemoDemand, Priority } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";

const STATE: Record<string, DemandState> = {
  todo: "A fazer",
  doing: "Fazendo",
  done: "Feito",
};
const PRIORITY: Record<string, Priority> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  state: string;
  priority: string;
  is_now: boolean;
  done_at: string | null;
  updated_at: string;
};

// Subtarefas, comentários, anexos e histórico chegam na T7, T9, T11 e T10: por ora, listas vazias.
export function toDemand(row: TaskRow): DemoDemand {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    state: STATE[row.state],
    priority: PRIORITY[row.priority],
    isNow: row.is_now,
    lastActivityAt: row.updated_at,
    ...(row.done_at ? { doneAt: row.done_at } : {}),
    subtasks: [],
    comments: [],
    attachments: [],
    history: [],
  };
}

export async function listDemands(): Promise<DemoDemand[]> {
  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, project_id, title, state, priority, is_now, done_at, updated_at",
    )
    .is("archived_at", null)
    .is("parent_task_id", null)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as TaskRow[]).map(toDemand);
}
