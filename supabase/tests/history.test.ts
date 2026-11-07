// T10: histórico por gatilhos (tasks/t10-spec.md, seções 2 e 4). Quem grava é o banco; ninguém altera o registro.
import { afterAll, beforeAll, expect, test } from "vitest";
import { admin, fixture, type TestUser } from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t10");

let a: TestUser;
let b: TestUser;
let orgA: string;
let projectA: string;
let otherProjectA: string;

async function insert(user: TestUser, table: string, row: object) {
  const { data, error } = await user.client
    .from(table)
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

const newTask = (title: string, extra: object = {}) =>
  insert(a, "tasks", {
    organization_id: orgA,
    project_id: projectA,
    title: `${title} ${run}`,
    ...extra,
  });

async function update(table: string, id: string, values: object) {
  const { error } = await a.client.from(table).update(values).eq("id", id);
  if (error) throw error;
}

// Lido com a chave de serviço, na ordem de gravação.
async function events(taskId: string) {
  const { data, error } = await admin
    .from("task_events")
    .select("type, changes, actor_id, actor_name")
    .eq("task_id", taskId)
    .order("id");
  if (error) throw error;
  return data;
}

const kinds = async (taskId: string) =>
  (await events(taskId)).map((e) => [e.type, e.changes]);

beforeAll(async () => {
  a = await createUser("a");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  await createOrg("Empresa B", b.id);
  projectA = (
    await insert(a, "projects", { organization_id: orgA, name: `Site ${run}` })
  ).id;
  otherProjectA = (
    await insert(a, "projects", { organization_id: orgA, name: `Loja ${run}` })
  ).id;
}, 60_000);

afterAll(cleanup, 60_000);

test("criar a demanda gera um evento, com autor e nome vindos da sessão", async () => {
  const task = await newTask("Criada");
  expect(await events(task.id)).toEqual([
    {
      type: "task_created",
      changes: {},
      actor_id: a.id,
      actor_name: `t10-a-${run}`,
    },
  ]);
});

test("cada campo mudado vira um evento; gravar o mesmo valor não gera nada", async () => {
  const task = await newTask("Campos");
  await update("tasks", task.id, { state: "doing", priority: "high" });
  await update("tasks", task.id, {
    title: `Campos novos ${run}`,
    due_date: "2026-11-07",
    description: "Texto longo que não vai para o histórico",
    is_now: true,
  });
  await update("tasks", task.id, { state: "doing", due_date: null });
  await update("tasks", task.id, { is_now: false });
  await update("tasks", task.id, { archived_at: new Date().toISOString() });
  await update("tasks", task.id, { archived_at: null });

  expect((await kinds(task.id)).slice(1)).toEqual([
    ["field_changed", { field: "state", from: "todo", to: "doing" }],
    ["field_changed", { field: "priority", from: "medium", to: "high" }],
    [
      "field_changed",
      { field: "title", from: `Campos ${run}`, to: `Campos novos ${run}` },
    ],
    ["field_changed", { field: "due_date", from: null, to: "2026-11-07" }],
    ["field_changed", { field: "description" }],
    ["field_changed", { field: "is_now", from: false, to: true }],
    ["field_changed", { field: "due_date", from: "2026-11-07", to: null }],
    ["field_changed", { field: "is_now", from: true, to: false }],
    ["task_archived", {}],
    ["task_restored", {}],
  ]);
});

test("trocar o projeto grava os nomes dos projetos", async () => {
  const task = await newTask("Projeto");
  // O app ainda não troca o projeto (sem grant); o registro vale para qualquer origem.
  const { error } = await admin
    .from("tasks")
    .update({ project_id: otherProjectA })
    .eq("id", task.id);
  if (error) throw error;
  const [, moved] = await events(task.id);
  expect(moved).toEqual({
    type: "field_changed",
    changes: { field: "project", from: `Site ${run}`, to: `Loja ${run}` },
    actor_id: null,
    actor_name: "Sistema",
  });
});

test("o que acontece com a subtarefa vai para a demanda mãe", async () => {
  const parent = await newTask("Mãe");
  const step = await newTask("Passo", { parent_task_id: parent.id });
  await update("tasks", step.id, { title: `Passo novo ${run}` });
  await update("tasks", step.id, { state: "done" });
  await update("tasks", step.id, { state: "todo" });
  await update("tasks", step.id, { archived_at: new Date().toISOString() });

  expect(await kinds(step.id)).toEqual([]);
  expect((await kinds(parent.id)).slice(1)).toEqual([
    ["subtask_added", { title: `Passo ${run}` }],
    ["subtask_renamed", { from: `Passo ${run}`, to: `Passo novo ${run}` }],
    ["subtask_done", { title: `Passo novo ${run}` }],
    ["subtask_reopened", { title: `Passo novo ${run}` }],
    ["subtask_removed", { title: `Passo novo ${run}` }],
  ]);
});

test("aplicar e tirar etiqueta gravam o nome dela", async () => {
  const task = await newTask("Etiquetas");
  const label = await insert(a, "labels", {
    organization_id: orgA,
    name: `Bug ${run}`,
  });
  await insert(a, "task_labels", {
    organization_id: orgA,
    task_id: task.id,
    label_id: label.id,
  });
  const removed = await a.client
    .from("task_labels")
    .delete()
    .eq("task_id", task.id)
    .eq("label_id", label.id);
  if (removed.error) throw removed.error;

  expect((await kinds(task.id)).slice(1)).toEqual([
    ["label_applied", { name: `Bug ${run}` }],
    ["label_removed", { name: `Bug ${run}` }],
  ]);
});

test("publicar e apagar comentário entram no histórico, sem o texto", async () => {
  const task = await newTask("Comentários");
  const comment = await insert(a, "task_comments", {
    organization_id: orgA,
    task_id: task.id,
    body: "Combinado com o cliente",
  });
  await update("task_comments", comment.id, {
    archived_at: new Date().toISOString(),
  });

  expect((await kinds(task.id)).slice(1)).toEqual([
    ["comment_added", {}],
    ["comment_removed", {}],
  ]);
});

test("apagar a demanda com etiqueta e subtarefa apaga os eventos e não falha", async () => {
  const task = await newTask("Apagada");
  await newTask("Passo da apagada", { parent_task_id: task.id });
  const label = await insert(a, "labels", {
    organization_id: orgA,
    name: `Some ${run}`,
  });
  await insert(a, "task_labels", {
    organization_id: orgA,
    task_id: task.id,
    label_id: label.id,
  });
  // O resetDemo dos E2E apaga assim, com a chave de serviço.
  const { error } = await admin.from("tasks").delete().eq("id", task.id);
  expect(error).toBeNull();
  expect(await events(task.id)).toEqual([]);
});

test("ninguém insere, altera ou apaga evento", async () => {
  const task = await newTask("Protegida");
  const created = await a.client.from("task_events").insert({
    organization_id: orgA,
    task_id: task.id,
    type: "task_created",
    changes: {},
  });
  expect(created.error?.code).toBe("42501");
  const changed = await a.client
    .from("task_events")
    .update({ actor_name: "Outro" })
    .eq("task_id", task.id);
  expect(changed.error?.code).toBe("42501");
  const deleted = await a.client
    .from("task_events")
    .delete()
    .eq("task_id", task.id);
  expect(deleted.error?.code).toBe("42501");
  expect(await events(task.id)).toHaveLength(1);
});

test("o membro lê o histórico da própria empresa; o de outra empresa, não", async () => {
  const task = await newTask("Privada");
  const own = await a.client
    .from("task_events")
    .select("type")
    .eq("task_id", task.id);
  expect(own.data).toEqual([{ type: "task_created" }]);
  const other = await b.client
    .from("task_events")
    .select("type")
    .eq("task_id", task.id);
  expect(other.data).toEqual([]);
});
