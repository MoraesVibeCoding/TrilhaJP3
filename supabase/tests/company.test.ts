// T3: a empresa da v1 existe e tem um dono; desde a tarefa de marca (TM) se chama Moraes Coding. O vínculo do dono é criado fora do repositório
// (o e-mail do Pedro não vai para um repositório público): ver docs/STATUS.md.
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "vitest";

const MORAES_CODING = "5d35ad87-c91e-4d87-a95a-11d421149f19";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

test("Moraes Coding existe com exatamente um dono", async () => {
  const org = await admin
    .from("organizations")
    .select("name")
    .eq("id", MORAES_CODING)
    .single();
  expect(org.error).toBeNull();
  expect(org.data).toEqual({ name: "Moraes Coding" });

  const owners = await admin
    .from("memberships")
    .select("user_id")
    .eq("organization_id", MORAES_CODING)
    .eq("role", "owner");
  expect(owners.error).toBeNull();
  expect(owners.data).toHaveLength(1);
});
