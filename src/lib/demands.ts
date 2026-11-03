// Leitura das demandas da empresa (a RLS da T5 só devolve as dela), no formato que as telas já usam.
import { getCurrentUser } from "@/lib/auth";
import { PRIORITY_LABELS, STATE_LABELS } from "@/lib/demand-labels";
import type { Demand } from "@/lib/demand-labels";
import type { Label } from "@/lib/labels";
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
  labels: readonly Label[] = [],
  comments: Demand["comments"] = [],
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
    labels,
    comments,
    attachments: [],
    history: [],
  };
}

type CommentRow = {
  id: string;
  task_id: string;
  body: string;
  author_name: string;
  created_by: string;
  created_at: string;
};

export async function listDemands(): Promise<Demand[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [tasks, applied, labels, comments] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, project_id, title, state, priority, is_now, done_at, updated_at, parent_task_id, created_at, description, due_date",
      )
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
    supabase.from("task_labels").select("task_id, label_id"),
    supabase.from("labels").select("id, name, color"),
    supabase
      .from("task_comments")
      .select("id, task_id, body, author_name, created_by, created_at")
      .is("archived_at", null),
  ]);
  const error = tasks.error ?? applied.error ?? labels.error ?? comments.error;
  if (error) throw error;
  const data = tasks.data;
  // T8: etiquetas aplicadas, por demanda, em ordem de nome.
  const byId = new Map((labels.data as Label[]).map((l) => [l.id, l]));
  const labelsOf = (taskId: string) =>
    (applied.data as { task_id: string; label_id: string }[])
      .filter((a) => a.task_id === taskId)
      .map((a) => byId.get(a.label_id))
      .filter((l): l is Label => !!l)
      .sort((x, y) => x.name.localeCompare(y.name, "pt-BR"));
  // T9: comentários ativos, do mais antigo ao mais novo; "mine" é de quem está logado.
  const commentsOf = (taskId: string) =>
    (comments.data as CommentRow[])
      .filter((c) => c.task_id === taskId)
      .sort((x, y) => x.created_at.localeCompare(y.created_at))
      .map((c) => ({
        id: c.id,
        author: c.author_name,
        at: c.created_at,
        text: c.body,
        mine: c.created_by === user.id,
      }));
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
          .map((s) => ({ id: s.id, title: s.title, done: s.state === "done" })),
        labelsOf(r.id),
        commentsOf(r.id),
      ),
    );
}

// As etiquetas da empresa, para o painel e o filtro (a RLS só devolve as dela).
export async function listLabels(): Promise<Label[]> {
  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .select("id, name, color")
    .order("name");
  if (error) throw error;
  return data as Label[];
}
