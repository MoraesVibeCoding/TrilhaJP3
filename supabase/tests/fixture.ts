// Usuários e empresas fictícios para os testes do banco, apagados no fim.
// Sufixo por execução: o banco de teste é compartilhado entre a sessão e o CI.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta a variável ${name}.`);
  return value;
}

export const url = env("NEXT_PUBLIC_SUPABASE_URL");
export const publishableKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const options = {
  auth: { persistSession: false, autoRefreshToken: false },
};
export const admin = createClient(
  url,
  env("SUPABASE_SERVICE_ROLE_KEY"),
  options,
);

export type TestUser = { id: string; client: SupabaseClient };

export function fixture(prefix: string) {
  const run = crypto.randomUUID().slice(0, 8);
  const password = crypto.randomUUID();
  const userIds: string[] = [];
  const orgIds: string[] = [];

  async function createUser(name: string): Promise<TestUser> {
    const { data, error } = await admin.auth.admin.createUser({
      email: `${prefix}-${name}-${run}@example.test`,
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

  // Apaga mesmo se um teste falhar; vínculos e projetos saem em cascata.
  async function cleanup() {
    if (orgIds.length)
      await admin.from("organizations").delete().in("id", orgIds);
    for (const id of userIds) await admin.auth.admin.deleteUser(id);
  }

  return { run, orgIds, createUser, createOrg, cleanup };
}
