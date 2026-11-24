import { beforeEach, expect, test, vi } from "vitest";

const auth = vi.hoisted(() => ({
  claims: { amr: [{ method: "recovery", timestamp: 1 }] } as object | null,
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getClaims: async () => ({ data: auth.claims && { claims: auth.claims } }),
      updateUser: auth.updateUser,
      signOut: auth.signOut,
    },
  }),
}));

const { setNewPassword } = await import("./actions");

const NEW = "senha-nova-bem-longa";
const form = (password = NEW, confirm = NEW) => {
  const data = new FormData();
  data.set("password", password);
  data.set("confirm", confirm);
  return data;
};

beforeEach(() => {
  auth.claims = { amr: [{ method: "recovery", timestamp: 1 }] };
  auth.updateUser.mockReset().mockResolvedValue({ error: null });
  auth.signOut.mockReset().mockResolvedValue({ error: null });
});

test("na sessão do link do e-mail: troca, encerra a sessão e manda entrar com a nova", async () => {
  await expect(setNewPassword(undefined, form())).rejects.toThrow(
    "redirect:/entrar?senha=trocada",
  );
  expect(auth.updateUser).toHaveBeenCalledWith({ password: NEW });
  expect(auth.signOut).toHaveBeenCalled();
});

test("sessão comum (entrou com senha) não troca por aqui: vai para a Conta, que pede a atual", async () => {
  auth.claims = { amr: [{ method: "password", timestamp: 1 }] };
  await expect(setNewPassword(undefined, form())).rejects.toThrow(
    "redirect:/conta",
  );
  expect(auth.updateUser).not.toHaveBeenCalled();
});

test("sem sessão: vai para a entrada", async () => {
  auth.claims = null;
  await expect(setNewPassword(undefined, form())).rejects.toThrow(
    "redirect:/entrar",
  );
  expect(auth.updateUser).not.toHaveBeenCalled();
});

test("senha curta ou diferente volta com o erro do campo", async () => {
  await expect(
    setNewPassword(undefined, form("curta", "curta")),
  ).resolves.toEqual({
    ok: false,
    errors: { password: "A senha precisa ter pelo menos 12 caracteres." },
  });
  expect(auth.updateUser).not.toHaveBeenCalled();
});

test("se o Auth recusar, avisa e mantém a sessão para tentar de novo", async () => {
  auth.updateUser.mockResolvedValue({ error: { message: "x" } });
  await expect(setNewPassword(undefined, form())).resolves.toEqual({
    ok: false,
    errors: { password: "Não foi possível trocar a senha. Tente de novo." },
  });
  expect(auth.signOut).not.toHaveBeenCalled();
});
