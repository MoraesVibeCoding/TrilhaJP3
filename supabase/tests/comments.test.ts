// T9: comentários (tasks/t9-spec.md, seção 4). Autor gravado pelo banco, nada se altera depois, só o autor apaga.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { admin, fixture, type TestUser } from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t9");

let a: TestUser;
let c: TestUser; // outro membro da empresa A
let b: TestUser;
let orgA: string;
let orgB: string;
let taskA: string;
let subtaskA: string;

async function insert(user: TestUser, table: string, row: object) {
  const { data, error } = await user.client
    .from(table)
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

const comment = (user: TestUser, body: string, extra: object = {}) =>
  user.client
    .from("task_comments")
    .insert({ organization_id: orgA, task_id: taskA, body, ...extra })
    .select("*")
    .single();

beforeAll(async () => {
  a = await createUser("a");
  c = await createUser("c");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
  const member = await admin
    .from("memberships")
    .insert({ organization_id: orgA, user_id: c.id, role: "member" });
  if (member.error) throw member.error;
  const projectA = await insert(a, "projects", {
    organization_id: orgA,
    name: `Projeto A ${run}`,
  });
  taskA = (
    await insert(a, "tasks", {
      organization_id: orgA,
      project_id: projectA.id,
      title: `Demanda ${run}`,
    })
  ).id;
  subtaskA = (
    await insert(a, "tasks", {
      organization_id: orgA,
      project_id: projectA.id,
      parent_task_id: taskA,
      title: `Passo ${run}`,
    })
  ).id;
}, 60_000);

afterAll(cleanup, 60_000);

describe("escrever", () => {
  test("o banco grava o autor e o nome a partir da sessão", async () => {
    const { data, error } = await comment(a, "Falta o rodapé.");
    expect(error).toBeNull();
    expect(data).toMatchObject({
      created_by: a.id,
      author_name: `t9-a-${run}`,
      body: "Falta o rodapé.",
      archived_at: null,
    });
  });

  test("o cliente não escolhe o autor nem o nome", async () => {
    for (const extra of [{ created_by: c.id }, { author_name: "Outro" }]) {
      const { error } = await comment(a, "Forjado", extra);
      expect(error?.code, JSON.stringify(extra)).toBe("42501");
    }
  });

  test("recusa texto vazio e texto com mais de 5.000 caracteres", async () => {
    for (const body of ["   ", "x".repeat(5001)]) {
      const { error } = await comment(a, body);
      expect(error?.code, String(body.length)).toBe("23514");
    }
  });

  test("não comenta em subtarefa", async () => {
    const { error } = await a.client.from("task_comments").insert({
      organization_id: orgA,
      task_id: subtaskA,
      body: "No passo",
    });
    expect(error?.message).toContain("comentário só vai em demanda");
  });
});

describe("depois de publicado", () => {
  test("o texto não muda", async () => {
    const { data } = await comment(a, "Original");
    const { error } = await a.client
      .from("task_comments")
      .update({ body: "Trocado" })
      .eq("id", data!.id);
    expect(error?.code).toBe("42501");
  });

  test("outro membro lê, mas não apaga; o autor apaga", async () => {
    const { data } = await comment(a, "Do Pedro");
    const read = await c.client
      .from("task_comments")
      .select("id")
      .eq("id", data!.id);
    expect(read.data).toEqual([{ id: data!.id }]);

    const now = new Date().toISOString();
    const byOther = await c.client
      .from("task_comments")
      .update({ archived_at: now })
      .eq("id", data!.id)
      .select("id");
    expect(byOther.data).toEqual([]);

    const byAuthor = await a.client
      .from("task_comments")
      .update({ archived_at: now })
      .eq("id", data!.id)
      .select("id");
    expect(byAuthor.data).toEqual([{ id: data!.id }]);
  });

  test("ninguém apaga de vez", async () => {
    const { data } = await comment(a, "Fica");
    const { error } = await a.client
      .from("task_comments")
      .delete()
      .eq("id", data!.id);
    expect(error?.code).toBe("42501");
  });
});

test("membro de outra empresa não lê nem escreve", async () => {
  const { data } = await comment(a, "Privado");
  const read = await b.client
    .from("task_comments")
    .select("id")
    .eq("id", data!.id);
  expect(read.data).toEqual([]);
  const write = await b.client.from("task_comments").insert({
    organization_id: orgA,
    task_id: taskA,
    body: "Intruso",
  });
  expect(write.error?.code).toBe("42501");
  const ownOrg = await b.client.from("task_comments").insert({
    organization_id: orgB,
    task_id: taskA,
    body: "Pela própria empresa",
  });
  expect(ownOrg.error?.code).toBe("23503");
});
