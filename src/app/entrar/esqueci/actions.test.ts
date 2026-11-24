import { beforeEach, expect, test, vi } from "vitest";

const auth = vi.hoisted(() => ({
  reset: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { resetPasswordForEmail: auth.reset },
  }),
}));

const { requestPasswordReset } = await import("./actions");

const form = (email?: string) => {
  const data = new FormData();
  if (email !== undefined) data.set("email", email);
  return data;
};
const SENT = {
  sent: true,
  message:
    "Se o e-mail estiver cadastrado, enviamos um link para criar uma senha nova. Ele vale por 1 hora.",
};

beforeEach(() => auth.reset.mockReset().mockResolvedValue({ error: null }));

test("envia o link para o e-mail normalizado", async () => {
  await expect(
    requestPasswordReset(undefined, form(" Pedro@Exemplo.com.br ")),
  ).resolves.toEqual(SENT);
  expect(auth.reset).toHaveBeenCalledWith("pedro@exemplo.com.br");
});

test("a resposta é a mesma quando o Supabase recusa: não revela se o e-mail existe", async () => {
  auth.reset.mockResolvedValue({ error: { message: "User not found" } });
  await expect(
    requestPasswordReset(undefined, form("ninguem@exemplo.com.br")),
  ).resolves.toEqual(SENT);
});

test("e-mail inválido volta com o aviso e nem chama o Supabase", async () => {
  await expect(
    requestPasswordReset(undefined, form("nao-e-email")),
  ).resolves.toEqual({
    sent: false,
    message: "Digite um e-mail válido.",
    email: "nao-e-email",
  });
  expect(auth.reset).not.toHaveBeenCalled();
});
