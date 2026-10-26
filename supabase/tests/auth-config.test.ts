// T3: o cadastro pelo app está fechado; contas só pelo painel ou pela chave de serviço.
// Lê a configuração pública do Auth: um signUp de verdade enviaria e-mail.
import { expect, test } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

test("o Auth do projeto não aceita cadastro público", async () => {
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: publishableKey },
  });
  expect(res.status).toBe(200);
  expect((await res.json()).disable_signup).toBe(true);
});
