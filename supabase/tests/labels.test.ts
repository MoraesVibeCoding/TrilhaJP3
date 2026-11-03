// T8: etiquetas da empresa (tasks/t8-spec.md, seção 4). Regras no banco: nome único, paleta, mesma empresa.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { fixture, type TestUser } from "./fixture";

const { run, cleanup, createUser, createOrg } = fixture("t8");

let a: TestUser;
let b: TestUser;
let orgA: string;
let orgB: string;
let taskA: string;
let subtaskA: string;
let labelB: string;

async function insert(user: TestUser, table: string, row: object) {
  const { data, error } = await user.client
    .from(table)
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

const label = (name: string, extra: object = {}) =>
  a.client
    .from("labels")
    .insert({ organization_id: orgA, name: `${name} ${run}`, ...extra })
    .select("*")
    .single();

beforeAll(async () => {
  a = await createUser("a");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
  const projectA = await insert(a, "projects", {
    organization_id: orgA,
    name: `Projeto A ${run}`,
  });
  const projectB = await insert(b, "projects", {
    organization_id: orgB,
    name: `Projeto B ${run}`,
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
  await insert(b, "tasks", {
    organization_id: orgB,
    project_id: projectB.id,
    title: `Da B ${run}`,
  });
  labelB = (
    await insert(b, "labels", { organization_id: orgB, name: `Da B ${run}` })
  ).id;
}, 60_000);

afterAll(cleanup, 60_000);

describe("etiquetas da empresa", () => {
  test("nasce em Névoa", async () => {
    const { data, error } = await label("Bug");
    expect(error).toBeNull();
    expect(data).toMatchObject({ color: "nevoa", organization_id: orgA });
  });

  test("não repete o nome, ignorando maiúsculas e espaços nas pontas", async () => {
    await label("Financeiro");
    const { error } = await a.client
      .from("labels")
      .insert({ organization_id: orgA, name: `  FINANCEIRO ${run}  ` });
    expect(error?.code).toBe("23505");
  });

  test("recusa nome vazio, nome com mais de 40 caracteres e cor fora da paleta", async () => {
    for (const row of [
      { name: "   " },
      { name: "x".repeat(41) },
      { name: `Azul ${run}`, color: "azul" },
    ]) {
      const { error } = await a.client
        .from("labels")
        .insert({ organization_id: orgA, ...row });
      expect(error?.code, JSON.stringify(row)).toBe("23514");
    }
  });

  test("troca a cor, mas não renomeia nem muda de empresa", async () => {
    const { data } = await label("Cor");
    const color = await a.client
      .from("labels")
      .update({ color: "tijolo" })
      .eq("id", data!.id)
      .select("color")
      .single();
    expect(color.data).toEqual({ color: "tijolo" });
    for (const change of [{ name: "Outro" }, { organization_id: orgB }]) {
      const { error } = await a.client
        .from("labels")
        .update(change)
        .eq("id", data!.id);
      expect(error?.code, JSON.stringify(change)).toBe("42501");
    }
  });
});

describe("aplicar numa demanda", () => {
  test("aplica e tira", async () => {
    const { data } = await label("Aplicada");
    const applied = await a.client.from("task_labels").insert({
      organization_id: orgA,
      task_id: taskA,
      label_id: data!.id,
    });
    expect(applied.error).toBeNull();
    const removed = await a.client
      .from("task_labels")
      .delete()
      .eq("task_id", taskA)
      .eq("label_id", data!.id)
      .select("label_id");
    expect(removed.data).toEqual([{ label_id: data!.id }]);
  });

  test("não aplica em subtarefa", async () => {
    const { data } = await label("Na subtarefa");
    const { error } = await a.client.from("task_labels").insert({
      organization_id: orgA,
      task_id: subtaskA,
      label_id: data!.id,
    });
    expect(error?.message).toContain("etiqueta só vai em demanda");
  });

  test("não aplica etiqueta de outra empresa, nem dizendo que é da própria", async () => {
    const { error } = await a.client.from("task_labels").insert({
      organization_id: orgA,
      task_id: taskA,
      label_id: labelB,
    });
    expect(error?.code).toBe("23503");
  });
});

test("membro de outra empresa não lê etiquetas nem aplicações", async () => {
  const { data } = await label("Privada");
  await a.client
    .from("task_labels")
    .insert({ organization_id: orgA, task_id: taskA, label_id: data!.id });
  const labels = await b.client.from("labels").select("id").eq("id", data!.id);
  expect(labels.data).toEqual([]);
  const applied = await b.client
    .from("task_labels")
    .select("label_id")
    .eq("task_id", taskA);
  expect(applied.data).toEqual([]);
});
