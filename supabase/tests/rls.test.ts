// T2: isolamento entre empresas, pela API pública (o mesmo caminho do navegador).
// Roda contra o Supabase de teste: npm run test:db (precisa das variáveis do Supabase).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta a variável ${name}.`);
  return value;
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, env("SUPABASE_SERVICE_ROLE_KEY"), options);

// Sufixo por execução: o banco de teste é compartilhado entre a sessão e o CI.
const run = crypto.randomUUID().slice(0, 8);
const password = crypto.randomUUID();
const userIds: string[] = [];
const orgIds: string[] = [];

async function createUser(name: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email: `t2-${name}-${run}@example.test`,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(
      `Não criou o usuário de teste (o projeto gratuito pode estar pausado): ${error.message}`,
    );
  }
  userIds.push(data.user.id);
  const client = createClient(url, publishableKey, options);
  const signIn = await client.auth.signInWithPassword({
    email: data.user.email!,
    password,
  });
  if (signIn.error) throw signIn.error;
  return { id: data.user.id, client };
}

async function createOrg(name: string, ownerId: string) {
  const { data, error } = await admin
    .from("organizations")
    .insert({ name: `${name} ${run}` })
    .select("id")
    .single();
  if (error) throw error;
  orgIds.push(data.id);
  const link = await admin
    .from("memberships")
    .insert({ organization_id: data.id, user_id: ownerId, role: "owner" });
  if (link.error) throw link.error;
  return data.id as string;
}

let a: { id: string; client: SupabaseClient };
let b: { id: string; client: SupabaseClient };
let loner: { id: string; client: SupabaseClient };
let orgA: string;
let orgB: string;

beforeAll(async () => {
  a = await createUser("a");
  b = await createUser("b");
  loner = await createUser("sem-vinculo");
  orgA = await createOrg("Empresa A", a.id);
  orgB = await createOrg("Empresa B", b.id);
}, 60_000);

afterAll(async () => {
  // Apaga mesmo se um teste falhar; os vínculos saem em cascata.
  if (orgIds.length)
    await admin.from("organizations").delete().in("id", orgIds);
  for (const id of userIds) await admin.auth.admin.deleteUser(id);
}, 60_000);

async function snapshot() {
  const orgs = await admin
    .from("organizations")
    .select("id, name")
    .in("id", orgIds)
    .order("id");
  const links = await admin
    .from("memberships")
    .select("organization_id, user_id, role")
    .in("organization_id", orgIds)
    .order("organization_id");
  return { orgs: orgs.data, links: links.data };
}

describe("leitura", () => {
  test("A lê só a própria empresa e os vínculos dela", async () => {
    const orgs = await a.client.from("organizations").select("id");
    expect(orgs.error).toBeNull();
    expect(orgs.data).toEqual([{ id: orgA }]);

    const links = await a.client
      .from("memberships")
      .select("organization_id, user_id, role");
    expect(links.error).toBeNull();
    expect(links.data).toEqual([
      { organization_id: orgA, user_id: a.id, role: "owner" },
    ]);
  });

  test("A não encontra a empresa B nem pelo id", async () => {
    const org = await a.client
      .from("organizations")
      .select("id")
      .eq("id", orgB);
    expect(org.data).toEqual([]);
    const links = await a.client
      .from("memberships")
      .select("user_id")
      .eq("organization_id", orgB);
    expect(links.data).toEqual([]);
  });

  test("usuário sem vínculo lê zero linhas", async () => {
    const orgs = await loner.client.from("organizations").select("id");
    expect(orgs.data).toEqual([]);
    const links = await loner.client.from("memberships").select("user_id");
    expect(links.data).toEqual([]);
  });
});

describe("escrita negada ao usuário logado", () => {
  test("A não cria, altera nem apaga empresa ou vínculo, e o banco não muda", async () => {
    const before = await snapshot();
    const attempts = [
      a.client.from("organizations").insert({ name: `Intrusa ${run}` }),
      a.client.from("organizations").update({ name: "x" }).eq("id", orgA),
      a.client.from("organizations").update({ name: "x" }).eq("id", orgB),
      a.client.from("organizations").delete().eq("id", orgA),
      a.client.from("organizations").delete().eq("id", orgB),
      a.client
        .from("memberships")
        .insert({ organization_id: orgB, user_id: a.id, role: "owner" }),
      a.client
        .from("memberships")
        .insert({ organization_id: orgA, user_id: loner.id, role: "member" }),
      a.client
        .from("memberships")
        .update({ role: "member" })
        .eq("user_id", a.id),
      a.client.from("memberships").delete().eq("organization_id", orgB),
    ];
    for (const { error } of await Promise.all(attempts)) {
      expect(error?.code).toBe("42501");
    }
    expect(await snapshot()).toEqual(before);
  });
});

describe("sem login", () => {
  test("a chave pública sozinha não lê nenhuma das tabelas", async () => {
    const anon = createClient(url, publishableKey, options);
    for (const table of ["organizations", "memberships"]) {
      const { error } = await anon.from(table).select("*");
      expect(error?.code).toBe("42501");
    }
  });
});

describe("função de acesso", () => {
  test("is_member não é chamável pela API", async () => {
    const inPublic = await a.client.rpc("is_member", { org: orgA });
    expect(inPublic.error).not.toBeNull();
    const inPrivate = await a.client
      .schema("private")
      .rpc("is_member", { org: orgA });
    expect(inPrivate.error).not.toBeNull();
  });
});
