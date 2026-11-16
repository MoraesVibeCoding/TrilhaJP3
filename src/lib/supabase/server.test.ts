import { expect, test, vi } from "vitest";

const store = vi.hoisted(() => ({
  set: vi.fn(),
  getAll: () => [{ name: "sb", value: "1" }],
}));
type Cookies = {
  getAll: () => unknown;
  setAll: (c: { name: string; value: string; options: object }[]) => void;
};
const captured = vi.hoisted(() => ({
  cookies: null as Cookies | null,
  fetch: null as typeof fetch | null,
}));

vi.mock("next/headers", () => ({
  cookies: async () => store,
  headers: async () => ({ get: () => "req-1" }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _u: string,
    _k: string,
    o: { cookies: Cookies; global: { fetch: typeof fetch } },
  ) => {
    captured.cookies = o.cookies;
    captured.fetch = o.global.fetch;
    return {};
  },
}));

const { createClient } = await import("./server");

test("lê e grava os cookies da requisição", async () => {
  await createClient();
  expect(captured.cookies!.getAll()).toEqual([{ name: "sb", value: "1" }]);
  captured.cookies!.setAll([
    { name: "sb", value: "2", options: { path: "/" } },
  ]);
  expect(store.set).toHaveBeenCalledWith("sb", "2", { path: "/" });
});

test("num Server Component, onde gravar cookie falha, segue sem erro", async () => {
  await createClient();
  store.set.mockImplementationOnce(() => {
    throw new Error("Cookies can only be modified in a Server Action");
  });
  expect(() =>
    captured.cookies!.setAll([{ name: "sb", value: "3", options: {} }]),
  ).not.toThrow();
});

test("T13: resposta de erro do Supabase vira log com o id da requisição", async () => {
  await createClient();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("{}", { status: 500 })),
  );
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await captured.fetch!("https://abc.supabase.co/rest/v1/tasks?id=eq.1");
  expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({
    event: "supabase.error",
    requestId: "req-1",
    target: "rest/tasks",
    status: 500,
  });
  log.mockRestore();
  vi.unstubAllGlobals();
});
