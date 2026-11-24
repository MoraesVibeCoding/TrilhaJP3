import { NextRequest } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";

const auth = vi.hoisted(() => ({ verifyOtp: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { verifyOtp: auth.verifyOtp } }),
}));

const { GET } = await import("./route");

const call = (query: string) =>
  GET(new NextRequest(`https://trilhajp3.vercel.app/auth/confirm${query}`));
const location = (res: Response) =>
  new URL(res.headers.get("location")!).pathname +
  new URL(res.headers.get("location")!).search;
const HASH = "a".repeat(56);

beforeEach(() => auth.verifyOtp.mockReset().mockResolvedValue({ error: null }));

test("link de recuperação válido vira sessão e abre a tela Nova senha", async () => {
  const res = await call(`?token_hash=${HASH}&type=recovery`);
  expect(auth.verifyOtp).toHaveBeenCalledWith({
    type: "recovery",
    token_hash: HASH,
  });
  expect(res.status).toBe(303);
  expect(location(res)).toBe("/nova-senha");
});

test("aceita o token do fluxo PKCE, com o prefixo pkce_", async () => {
  const res = await call(`?token_hash=pkce_${HASH}&type=recovery`);
  expect(location(res)).toBe("/nova-senha");
  expect(auth.verifyOtp).toHaveBeenCalledWith({
    type: "recovery",
    token_hash: `pkce_${HASH}`,
  });
});

test("link vencido ou já usado volta para a entrada com o aviso", async () => {
  auth.verifyOtp.mockResolvedValue({
    error: { message: "Token has expired or is invalid" },
  });
  expect(location(await call(`?token_hash=${HASH}&type=recovery`))).toBe(
    "/entrar?link=invalido",
  );
});

test("sem token, com outro tipo ou token estranho: nem tenta, volta para a entrada", async () => {
  for (const q of [
    "",
    `?type=recovery`,
    `?token_hash=${HASH}&type=magiclink`,
    `?token_hash=${HASH}`,
    "?token_hash=../x&type=recovery",
  ]) {
    expect(location(await call(q)), q).toBe("/entrar?link=invalido");
  }
  expect(auth.verifyOtp).not.toHaveBeenCalled();
});

test("ignora qualquer destino pedido na URL: não vira redirecionamento aberto", async () => {
  const res = await call(
    `?token_hash=${HASH}&type=recovery&next=https://evil.com`,
  );
  expect(location(res)).toBe("/nova-senha");
  expect(new URL(res.headers.get("location")!).origin).toBe(
    "https://trilhajp3.vercel.app",
  );
});
