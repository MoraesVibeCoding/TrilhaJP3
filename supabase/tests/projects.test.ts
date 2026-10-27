// T4: projetos isolados por empresa, pela API pública (o mesmo caminho do navegador).
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

const { run, cleanup, createUser, createOrg } = fixture("t4");

let a: TestUser;
let b: TestUser;
let orgA: string;
let orgB: string;
let projectB: string;

beforeAll(async () => {
  a = await createUser("a");
  b = await createUser("b");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
  const created = await b.client
    .from("projects")
    .insert({ organization_id: orgB, name: `Projeto B ${run}` })
    .select("id")
    .single();
  if (created.error) throw created.error;
  projectB = created.data.id;
}, 60_000);

afterAll(cleanup, 60_000);

async function createA(name: string, extra: object = {}) {
  return a.client
    .from("projects")
    .insert({ organization_id: orgA, name, ...extra })
    .select("*")
    .single();
}

describe("na própria empresa", () => {
  test("cria com os padrões, e o autor é quem está logado", async () => {
    const { data, error } = await createA(`Novo ${run}`);
    expect(error).toBeNull();
    expect(data).toMatchObject({
      organization_id: orgA,
      status: "idea",
      priority: "medium",
      created_by: a.id,
      archived_at: null,
    });
  });

  test("lê só os projetos da própria empresa", async () => {
    const { data } = await a.client.from("projects").select("organization_id");
    expect(data!.length).toBeGreaterThan(0);
    expect(new Set(data!.map((p) => p.organization_id))).toEqual(
      new Set([orgA]),
    );
  });

  test("edita, e updated_at avança", async () => {
    const { data: created } = await createA(`Editar ${run}`);
    const { data, error } = await a.client
      .from("projects")
      .update({
        name: `Editado ${run}`,
        status: "in_progress",
        priority: "high",
      })
      .eq("id", created!.id)
      .select("name, status, priority, updated_at")
      .single();
    expect(error).toBeNull();
    expect(data).toMatchObject({
      name: `Editado ${run}`,
      status: "in_progress",
      priority: "high",
    });
    expect(Date.parse(data!.updated_at)).toBeGreaterThan(
      Date.parse(created!.updated_at),
    );
  });

  test("arquiva e restaura", async () => {
    const { data: created } = await createA(`Arquivar ${run}`);
    const archived = await a.client
      .from("projects")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", created!.id)
      .select("archived_at")
      .single();
    expect(archived.data!.archived_at).not.toBeNull();
    const restored = await a.client
      .from("projects")
      .update({ archived_at: null })
      .eq("id", created!.id)
      .select("archived_at")
      .single();
    expect(restored.data!.archived_at).toBeNull();
  });

  test("não apaga (só arquiva)", async () => {
    const { data: created } = await createA(`Apagar ${run}`);
    const { error } = await a.client
      .from("projects")
      .delete()
      .eq("id", created!.id);
    expect(error?.code).toBe("42501");
  });

  test("não troca a empresa nem o autor de um projeto", async () => {
    const { data: created } = await createA(`Mover ${run}`);
    for (const change of [{ organization_id: orgB }, { created_by: b.id }]) {
      const { error } = await a.client
        .from("projects")
        .update(change)
        .eq("id", created!.id);
      expect(error?.code).toBe("42501");
    }
  });

  test("não escolhe o autor ao criar", async () => {
    const { error } = await createA(`Autor ${run}`, { created_by: b.id });
    expect(error?.code).toBe("42501");
  });

  test("recusa nome vazio, link que não é https e estado inválido", async () => {
    for (const extra of [
      { name: "   " },
      { link: "javascript:alert(1)" },
      { link: "http://exemplo.com" },
      { status: "archived" },
      { priority: "urgent" },
    ]) {
      const { error } = await createA(`Inválido ${run}`, extra);
      expect(error?.code, JSON.stringify(extra)).toBe("23514");
    }
  });
});

describe("em outra empresa", () => {
  test("não lê o projeto da empresa B", async () => {
    const { data } = await a.client
      .from("projects")
      .select("id")
      .eq("id", projectB);
    expect(data).toEqual([]);
  });

  test("não cria projeto na empresa B", async () => {
    const { error } = await a.client
      .from("projects")
      .insert({ organization_id: orgB, name: `Intruso ${run}` });
    expect(error?.code).toBe("42501");
  });

  test("não altera nem arquiva o projeto da empresa B", async () => {
    await a.client
      .from("projects")
      .update({ name: "invadido", archived_at: new Date().toISOString() })
      .eq("id", projectB);
    const { data } = await admin
      .from("projects")
      .select("name, archived_at")
      .eq("id", projectB)
      .single();
    expect(data).toEqual({ name: `Projeto B ${run}`, archived_at: null });
  });
});

test("sem login, nada", async () => {
  const anon = createClient(url, publishableKey, options);
  const { error } = await anon.from("projects").select("id");
  expect(error?.code).toBe("42501");
});
