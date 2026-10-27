// T5: a empresa do E2E recebe os projetos e demandas de demonstração, agora no Supabase.
// shortcut: lê demo-data.ts; quando a T5.4 apagar esse arquivo, os dados passam para cá.
import type { SupabaseClient } from "@supabase/supabase-js";
import { demoDemands, demoNow, demoProjects } from "../src/lib/demo-data";

const STATUS = {
  Ideia: "idea",
  "Em andamento": "in_progress",
  Pausado: "paused",
  Concluído: "done",
} as const;
const STATE = { "A fazer": "todo", Fazendo: "doing", Feito: "done" } as const;
const PRIORITY = { Alta: "high", Média: "medium", Baixa: "low" } as const;

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// Devolve o id real de cada demanda de demonstração (d1 → uuid).
export async function seedDemo(admin: SupabaseClient, organizationId: string) {
  const projectIds = new Map<string, string>();
  for (const p of demoProjects) {
    const { data, error } = await admin
      .from("projects")
      .insert({
        organization_id: organizationId,
        name: p.name,
        status: STATUS[p.status],
      })
      .select("id")
      .single();
    if (error) throw error;
    projectIds.set(p.id, data.id);
  }

  const ids: Record<string, string> = {};
  const insert = async (row: object) => {
    const { data, error } = await admin
      .from("tasks")
      .insert({ organization_id: organizationId, ...row })
      .select("id, updated_at")
      .single();
    if (error) throw error;
    return data;
  };

  // done_at só muda por gatilho; a concluída em outro dia é corrigida depois, e essa alteração
  // move o updated_at dela para agora. Por isso ela entra primeiro e as outras ficam alguns
  // segundos à frente, na mesma ordem de atividade da demonstração.
  const old = demoDemands.filter(
    (d) => d.doneAt && !sameDay(new Date(d.doneAt), demoNow),
  );
  let base = Date.now();
  for (const d of old) {
    const task = await insert(row(d));
    ids[d.id] = task.id;
    const back = demoNow.getTime() - new Date(d.doneAt!).getTime();
    const { data, error } = await admin
      .from("tasks")
      .update({ done_at: new Date(Date.now() - back).toISOString() })
      .eq("id", task.id)
      .select("updated_at")
      .single();
    if (error) throw error;
    base = Math.max(base, new Date(data.updated_at).getTime());
  }

  const rest = demoDemands
    .filter((d) => !old.includes(d))
    .toSorted((a, b) => a.lastActivityAt.localeCompare(b.lastActivityAt));
  for (const [i, d] of rest.entries()) {
    const at = new Date(base + (i + 1) * 1000).toISOString();
    const task = await insert({ ...row(d), updated_at: at });
    ids[d.id] = task.id;
    for (const [j, s] of d.subtasks.entries()) {
      await insert({
        ...row(d),
        is_now: false,
        parent_task_id: task.id,
        title: s.title,
        state: s.done ? "done" : "todo",
        created_at: new Date(base + j * 1000).toISOString(),
        updated_at: at,
      });
    }
  }
  return ids;

  function row(d: (typeof demoDemands)[number]) {
    return {
      project_id: projectIds.get(d.projectId),
      title: d.title,
      state: STATE[d.state],
      priority: PRIORITY[d.priority],
      is_now: d.isNow ?? false,
    };
  }
}
