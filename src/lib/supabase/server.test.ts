import { expect, test, vi } from "vitest";

const store = vi.hoisted(() => ({
  set: vi.fn(),
  getAll: () => [{ name: "sb", value: "1" }],
}));
type Cookies = {
  getAll: () => unknown;
  setAll: (c: { name: string; value: string; options: object }[]) => void;
};
const captured = vi.hoisted(() => ({ cookies: null as Cookies | null }));

vi.mock("next/headers", () => ({ cookies: async () => store }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_u: string, _k: string, o: { cookies: Cookies }) => {
    captured.cookies = o.cookies;
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
