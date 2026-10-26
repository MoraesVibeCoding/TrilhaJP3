import { beforeEach, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({
  signInError: null as object | null,
  calls: [] as string[],
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: async () => {
        state.calls.push("signIn");
        return { error: state.signInError };
      },
      signOut: async () => {
        state.calls.push("signOut");
        return { error: null };
      },
    },
  }),
}));

const { signIn, signOut } = await import("./actions");

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const valid = { email: "pedro@exemplo.com.br", password: "senha-certa" };
const FAILED = {
  error: "E-mail ou senha incorretos. Confira e tente de novo.",
};

beforeEach(() => {
  state.signInError = null;
  state.calls = [];
});

test("entrada inválida volta o erro genérico sem chamar o Supabase", async () => {
  await expect(signIn(undefined, form({ email: "x" }))).resolves.toEqual(
    FAILED,
  );
  expect(state.calls).toEqual([]);
});

test("senha errada volta o mesmo erro genérico", async () => {
  state.signInError = { message: "Invalid login credentials" };
  await expect(signIn(undefined, form(valid))).resolves.toEqual(FAILED);
});

test("login certo volta para o destino seguro", async () => {
  await expect(
    signIn(undefined, form({ ...valid, de: "/demandas" })),
  ).rejects.toThrow("redirect:/demandas");
  await expect(
    signIn(undefined, form({ ...valid, de: "//evil.com" })),
  ).rejects.toThrow("redirect:/");
});

test("sair encerra a sessão e vai para /entrar", async () => {
  await expect(signOut()).rejects.toThrow("redirect:/entrar");
  expect(state.calls).toEqual(["signOut"]);
});
