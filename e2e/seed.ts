// T5: a empresa do E2E recebe os projetos e demandas de demonstração, agora no Supabase.
// shortcut: lê demo-data.ts; quando a T5.4 apagar esse arquivo, os dados passam para cá.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

// O que o global-setup criou; os testes leem daqui (process.env passa para os workers).
export type Seed = {
  organizationId: string;
  projects: Record<string, string>;
  demands: Record<string, string>;
};

export const seed = (): Seed => JSON.parse(process.env.E2E_SEED!);

export async function seedDemo(admin: SupabaseClient, organizationId: string) {
  const projects: Record<string, string> = {};
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
    projects[p.id] = data.id;
  }
  const demands = Object.fromEntries(
    demoDemands.map((d) => [d.id, crypto.randomUUID()]),
  );
  const result = { organizationId, projects, demands };
  await seedTasks(admin, result);
  return result;
}

// Teste que grava no banco chama no fim: as demandas voltam ao estado inicial, com os mesmos ids.
export async function resetDemo() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const current = seed();
  const { error } = await admin
    .from("tasks")
    .delete()
    .eq("organization_id", current.organizationId);
  if (error) throw error;
  await seedTasks(admin, current);
}

async function seedTasks(
  admin: SupabaseClient,
  { organizationId, projects, demands }: Seed,
) {
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
    for (const [j, s] of d.subtasks.entries()) {
      await insert({
        ...row(d),
        id: crypto.randomUUID(),
        is_now: false,
        parent_task_id: task.id,
        title: s.title,
        state: s.done ? "done" : "todo",
        created_at: new Date(base + j * 1000).toISOString(),
        updated_at: at,
      });
    }
  }

  function row(d: (typeof demoDemands)[number]) {
    return {
      id: demands[d.id],
      project_id: projects[d.projectId],
      title: d.title,
      state: STATE[d.state],
      priority: PRIORITY[d.priority],
      is_now: d.isNow ?? false,
    };
  }
}
