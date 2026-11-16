import { afterEach, beforeEach, expect, test, vi } from "vitest";

const headerStore = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => headerStore.value }),
}));

const { currentRequestId, logError, loggedFetch, supabaseTarget } =
  await import("./log");

let lines: unknown[];
beforeEach(() => {
  lines = [];
  vi.spyOn(console, "error").mockImplementation((line: string) =>
    lines.push(JSON.parse(line)),
  );
});
afterEach(() => vi.restoreAllMocks());

test("uma linha JSON por evento, com nível, evento e os campos", () => {
  logError("request.error", {
    requestId: "gru1::abc",
    route: "/demandas/[id]",
    error: "falhou",
  });
  expect(lines).toEqual([
    {
      level: "error",
      event: "request.error",
      requestId: "gru1::abc",
      route: "/demandas/[id]",
      error: "falhou",
    },
  ]);
});

test("só os campos permitidos saem: token, senha ou corpo nunca vão para o log", () => {
  logError("supabase.error", {
    status: 500,
    token: "eyJ-segredo",
    password: "123",
    body: "comentário do usuário",
  } as never);
  expect(lines).toEqual([
    { level: "error", event: "supabase.error", status: 500 },
  ]);
});

test("a mensagem de erro é cortada em 500 caracteres", () => {
  logError("request.error", { error: "x".repeat(900) });
  expect((lines[0] as { error: string }).error).toHaveLength(500);
});

test("o alvo do Supabase guarda só a tabela, o bucket ou a rota do Auth, sem ids nem nomes de arquivo", () => {
  const base = "https://abc.supabase.co";
  expect(supabaseTarget(`${base}/rest/v1/tasks?id=eq.123&select=id`)).toBe(
    "rest/tasks",
  );
  expect(
    supabaseTarget(
      `${base}/storage/v1/object/sign/attachments/org/task/uuid-contrato.pdf`,
    ),
  ).toBe("storage/object/sign/attachments");
  expect(
    supabaseTarget(`${base}/storage/v1/object/attachments/org/t/u-a.png`),
  ).toBe("storage/object/attachments");
  expect(supabaseTarget(`${base}/auth/v1/token?grant_type=password`)).toBe(
    "auth/token",
  );
  expect(supabaseTarget(`${base}/rest/v1/rpc/is_member`)).toBe(
    "rest/rpc/is_member",
  );
  expect(supabaseTarget("nao-e-url")).toBe("desconhecido");
});

test("a chamada ao Supabase que falha vira log com alvo, status e duração; a que dá certo, não", async () => {
  const real = vi
    .fn()
    .mockResolvedValueOnce(new Response("{}", { status: 200 }))
    .mockResolvedValueOnce(
      new Response('{"message":"duplicate key (Cliente X)"}', { status: 409 }),
    );
  vi.stubGlobal("fetch", real);
  const fetcher = loggedFetch("gru1::abc");
  await fetcher("https://abc.supabase.co/rest/v1/tasks?id=eq.1", {
    method: "GET",
  });
  const res = await fetcher("https://abc.supabase.co/rest/v1/labels", {
    method: "POST",
  });
  expect(res.status).toBe(409);
  // o corpo continua inteiro para o supabase-js ler
  await expect(res.json()).resolves.toEqual({
    message: "duplicate key (Cliente X)",
  });
  expect(lines).toEqual([
    {
      level: "error",
      event: "supabase.error",
      requestId: "gru1::abc",
      method: "POST",
      target: "rest/labels",
      status: 409,
      durationMs: expect.any(Number),
    },
  ]);
  vi.unstubAllGlobals();
});

test("erro de rede também vira log, e o erro segue para quem chamou", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
  await expect(
    loggedFetch(undefined)(new URL("https://abc.supabase.co/auth/v1/user")),
  ).rejects.toThrow("offline");
  expect(lines).toEqual([
    {
      level: "error",
      event: "supabase.error",
      method: "GET",
      target: "auth/user",
      durationMs: expect.any(Number),
      error: "offline",
    },
  ]);
  vi.unstubAllGlobals();
});

test("o id da requisição vem do cabeçalho que o Proxy grava", async () => {
  headerStore.value = "gru1::xyz";
  await expect(currentRequestId()).resolves.toBe("gru1::xyz");
  headerStore.value = null;
  await expect(currentRequestId()).resolves.toBeUndefined();
});
