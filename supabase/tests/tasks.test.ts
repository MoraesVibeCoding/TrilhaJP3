// T5: demandas isoladas por empresa, pela API pública (o mesmo caminho do navegador).
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  admin,
  fixture,
  options,
  publishableKey,
  url,
  type TestUser,
} from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t5");

let a: TestUser;
let b: TestUser;
let orgA: string;
let orgB: string;
let projectA: string;
let projectB: string;
let taskB: string;

async function createProject(user: TestUser, org: string, name: string) {
  const { data, error } = await user.client
    .from("projects")
    .insert({ organization_id: org, name: `${name} ${run}` })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

beforeAll(async () => {
  a = await createUser("a");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
  projectA = await createProject(a, orgA, "Projeto A");
  projectB = await createProject(b, orgB, "Projeto B");
  const created = await b.client
    .from("tasks")
    .insert({ organization_id: orgB, project_id: projectB, title: "Da B" })
    .select("id")
    .single();
  if (created.error) throw created.error;
  taskB = created.data.id;
}, 60_000);

afterAll(cleanup, 60_000);

function createA(title: string, extra: object = {}) {
  return a.client
    .from("tasks")
    .insert({
      organization_id: orgA,
      project_id: projectA,
      title,
      ...extra,
    })
    .select("*")
    .single();
}

describe("na própria empresa", () => {
  test("cria com os padrões, e o autor é quem está logado", async () => {
    const { data, error } = await createA(`Nova ${run}`);
    expect(error).toBeNull();
    expect(data).toMatchObject({
      state: "todo",
      priority: "medium",
      is_now: false,
      done_at: null,
      created_by: a.id,
      archived_at: null,
    });
  });

  test("done_at liga quando vira Feito e desliga quando sai", async () => {
    const { data: task } = await createA(`Concluir ${run}`);
    const done = await a.client
      .from("tasks")
      .update({ state: "done" })
      .eq("id", task!.id)
      .select("done_at, updated_at")
      .single();
    expect(done.data!.done_at).not.toBeNull();
    const back = await a.client
      .from("tasks")
      .update({ state: "doing" })
      .eq("id", task!.id)
      .select("done_at")
      .single();
    expect(back.data!.done_at).toBeNull();
  });

  test("no máximo uma Agora por empresa", async () => {
    const first = await createA(`Agora 1 ${run}`, { is_now: true });
    expect(first.error).toBeNull();
    const second = await createA(`Agora 2 ${run}`, { is_now: true });
    expect(second.error?.code).toBe("23505");
    await a.client
      .from("tasks")
      .update({ is_now: false })
      .eq("id", first.data!.id);
  });

  test("não apaga, não troca empresa, projeto, autor nem done_at", async () => {
    const { data: task } = await createA(`Fixa ${run}`);
    const del = await a.client.from("tasks").delete().eq("id", task!.id);
    expect(del.error?.code).toBe("42501");
    for (const change of [
      { organization_id: orgB },
      { project_id: projectB },
      { created_by: b.id },
      { done_at: new Date().toISOString() },
    ]) {
      const { error } = await a.client
        .from("tasks")
        .update(change)
        .eq("id", task!.id);
      expect(error?.code, JSON.stringify(change)).toBe("42501");
    }
  });

  test("recusa título vazio, estado e prioridade inválidos", async () => {
    for (const extra of [
      { title: "  " },
      { state: "blocked" },
      { priority: "urgent" },
    ]) {
      const { error } = await createA(`Inválida ${run}`, extra);
      expect(error?.code, JSON.stringify(extra)).toBe("23514");
    }
  });
});

describe("em outra empresa", () => {
  test("não usa projeto de outra empresa, nem dizendo que é da própria", async () => {
    const { error } = await a.client.from("tasks").insert({
      organization_id: orgA,
      project_id: projectB,
      title: `Cruzada ${run}`,
    });
    expect(error?.code).toBe("23503");
  });

  test("não cria demanda na empresa B", async () => {
    const { error } = await a.client.from("tasks").insert({
      organization_id: orgB,
      project_id: projectB,
      title: `Intrusa ${run}`,
    });
    expect(error?.code).toBe("42501");
  });

  test("não lê nem altera a demanda da empresa B", async () => {
    const read = await a.client.from("tasks").select("id").eq("id", taskB);
    expect(read.data).toEqual([]);
    await a.client
      .from("tasks")
      .update({ title: "invadida", state: "done" })
      .eq("id", taskB);
    const { data } = await admin
      .from("tasks")
      .select("title, state")
      .eq("id", taskB)
      .single();
    expect(data).toEqual({ title: "Da B", state: "todo" });
  });
});

test("sem login, nada", async () => {
  const anon = createClient(url, publishableKey, options);
  const { error } = await anon.from("tasks").select("id");
  expect(error?.code).toBe("42501");
});
