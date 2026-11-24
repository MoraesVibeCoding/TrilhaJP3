import { beforeEach, expect, test, vi } from "vitest";

const auth = vi.hoisted(() => ({
  updateUser: vi.fn(),
  check: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => ({
    id: "u1",
    email: "pedro@exemplo.com.br",
    organizationId: "org-1",
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { updateUser: auth.updateUser } }),
}));
// O cliente sem sessão que só confere a senha atual.
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { signInWithPassword: auth.check } }),
}));

const { changePassword } = await import("./actions");

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const NEW = "senha-nova-bem-longa";
const valid = { current: "a-senha-atual-1", password: NEW, confirm: NEW };

beforeEach(() => {
  auth.updateUser.mockReset().mockResolvedValue({ error: null });
  auth.check.mockReset().mockResolvedValue({ error: null });
});

test("confere a senha atual com o e-mail da sessão e só então troca", async () => {
  await expect(changePassword(undefined, form(valid))).resolves.toEqual({
    ok: true,
    message: "Senha trocada.",
  });
  expect(auth.check).toHaveBeenCalledWith({
    email: "pedro@exemplo.com.br",
    password: "a-senha-atual-1",
  });
  expect(auth.updateUser).toHaveBeenCalledWith({ password: NEW });
});

test("senha atual errada: avisa no campo e não troca nada", async () => {
  auth.check.mockResolvedValue({
    error: { message: "Invalid login credentials" },
  });
  await expect(changePassword(undefined, form(valid))).resolves.toEqual({
    ok: false,
    errors: { current: "A senha atual não confere." },
  });
  expect(auth.updateUser).not.toHaveBeenCalled();
});

test("entrada inválida volta com o erro do campo, sem tocar no Auth", async () => {
  await expect(
    changePassword(
      undefined,
      form({ ...valid, confirm: "outra-coisa-qualquer" }),
    ),
  ).resolves.toEqual({
    ok: false,
    errors: { confirm: "As 2 senhas não são iguais." },
  });
  expect(auth.check).not.toHaveBeenCalled();
});

test("se o Auth recusar a troca, avisa sem detalhe", async () => {
  auth.updateUser.mockResolvedValue({ error: { message: "weak password" } });
  await expect(changePassword(undefined, form(valid))).resolves.toEqual({
    ok: false,
    errors: { password: "Não foi possível trocar a senha. Tente de novo." },
  });
});
