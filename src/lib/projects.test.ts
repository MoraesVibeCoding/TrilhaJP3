import { expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({ error: null as object | null, order: "" }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({
        order: async (column: string) => {
          db.order = column;
          return { data: db.error ? null : [{ id: "1" }], error: db.error };
        },
      }),
    }),
  }),
}));

const { listProjects } = await import("./projects");

test("lê os projetos em ordem de nome", async () => {
  await expect(listProjects()).resolves.toEqual([{ id: "1" }]);
  expect(db.order).toBe("name");
});

test("erro do banco não vira lista vazia", async () => {
  db.error = { message: "falhou" };
  await expect(listProjects()).rejects.toEqual({ message: "falhou" });
});
