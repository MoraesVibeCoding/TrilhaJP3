import { beforeEach, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({
  claims: null as { sub: string; email?: string } | null,
  memberships: [] as { organization_id: string }[],
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getClaims: async () => ({
        data: state.claims ? { claims: state.claims } : null,
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        limit: async () => ({ data: state.memberships, error: null }),
      }),
    }),
  }),
}));

const { getCurrentUser } = await import("./auth");

beforeEach(() => {
  state.claims = null;
  state.memberships = [];
});

test("sem sessão verificada, manda para /entrar", async () => {
  await expect(getCurrentUser()).rejects.toThrow("redirect:/entrar");
});

test("com sessão e vínculo, devolve id, e-mail e empresa", async () => {
  state.claims = { sub: "u1", email: "pedro@exemplo.com.br" };
  state.memberships = [{ organization_id: "o1" }];
  await expect(getCurrentUser()).resolves.toEqual({
    id: "u1",
    email: "pedro@exemplo.com.br",
    organizationId: "o1",
  });
});

test("com sessão e sem vínculo, falha em vez de voltar para /entrar (evita laço)", async () => {
  state.claims = { sub: "u1" };
  await expect(getCurrentUser()).rejects.toThrow(/sem empresa/);
});
