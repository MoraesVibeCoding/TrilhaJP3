// T7: subtarefas de um nível (tasks/t7-spec.md, seção 5). A regra mora no banco: o app não consegue furá-la.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { fixture, type TestUser } from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t7");

let a: TestUser;
let b: TestUser;
let orgA: string;
let orgB: string;
let projectA: string;
let otherProjectA: string;
let projectB: string;
let parentA: string;
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

async function createTask(
  user: TestUser,
  org: string,
  project: string,
  title: string,
  extra: object = {},
) {
  return user.client
    .from("tasks")
    .insert({
      organization_id: org,
      project_id: project,
      title: `${title} ${run}`,
      ...extra,
    })
    .select("*")
    .single();
}

beforeAll(async () => {
  a = await createUser("a");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
  projectA = await createProject(a, orgA, "Projeto A");
  otherProjectA = await createProject(a, orgA, "Outro projeto A");
  projectB = await createProject(b, orgB, "Projeto B");
  const parent = await createTask(a, orgA, projectA, "Mãe");
  if (parent.error) throw parent.error;
  parentA = parent.data.id;
  const other = await createTask(b, orgB, projectB, "Da B");
  if (other.error) throw other.error;
  taskB = other.data.id;
}, 60_000);

afterAll(cleanup, 60_000);

const child = (extra: object = {}) =>
  createTask(a, orgA, projectA, "Passo", { parent_task_id: parentA, ...extra });

describe("subtarefa de uma demanda de primeiro nível", () => {
  test("é criada na própria empresa e no mesmo projeto", async () => {
    const { data, error } = await child();
    expect(error).toBeNull();
    expect(data).toMatchObject({ parent_task_id: parentA, state: "todo" });
  });

  test("não pode ser a Agora, nem na criação nem depois", async () => {
    const created = await child({ is_now: true });
    expect(created.error?.code).toBe("23514");

    const { data } = await child();
    const update = await a.client
      .from("tasks")
      .update({ is_now: true })
      .eq("id", data!.id);
    expect(update.error?.code).toBe("23514");
  });

  test("não troca de mãe depois de criada", async () => {
    const { data } = await child();
    const other = await createTask(a, orgA, projectA, "Outra mãe");
    const { error } = await a.client
      .from("tasks")
      .update({ parent_task_id: other.data!.id })
      .eq("id", data!.id);
    expect(error?.code).toBe("42501");
  });
});

describe("a regra de um nível recusa", () => {
  test("subtarefa de subtarefa", async () => {
    const { data } = await child();
    const { error } = await createTask(a, orgA, projectA, "Neta", {
      parent_task_id: data!.id,
    });
    expect(error?.message).toContain("subtarefa só tem um nível");
  });

  test("mãe de outro projeto", async () => {
    const { error } = await createTask(a, orgA, otherProjectA, "Fora", {
      parent_task_id: parentA,
    });
    expect(error?.message).toContain("subtarefa só tem um nível");
  });

  test("mãe arquivada", async () => {
    const archived = await createTask(a, orgA, projectA, "Arquivada");
    await a.client
      .from("tasks")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", archived.data!.id);
    const { error } = await createTask(a, orgA, projectA, "Órfã", {
      parent_task_id: archived.data!.id,
    });
    expect(error?.message).toContain("subtarefa só tem um nível");
  });

  test("mãe de outra empresa, que nem aparece para quem tenta", async () => {
    const { error } = await createTask(a, orgA, projectA, "Intrusa", {
      parent_task_id: taskB,
    });
    expect(error?.message).toContain("subtarefa só tem um nível");
  });
});

test("membro de outra empresa não lê nem altera as subtarefas", async () => {
  const { data } = await child();
  const read = await b.client.from("tasks").select("id").eq("id", data!.id);
  expect(read.data).toEqual([]);
  const update = await b.client
    .from("tasks")
    .update({ state: "done" })
    .eq("id", data!.id)
    .select("id");
  expect(update.data).toEqual([]);
});
