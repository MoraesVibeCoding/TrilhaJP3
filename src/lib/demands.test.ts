import { expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  error: null as object | null,
  calls: [] as string[],
}));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const chain = {
        select: () => chain,
        is: (column: string) => {
          db.calls.push(`${table}.is(${column})`);
          return chain;
        },
        order: async () => ({
          data: db.error ? null : [row],
          error: db.error,
        }),
      };
      return chain;
    },
  }),
}));

const row = {
  id: "t1",
  project_id: "p1",
  title: "Revisar textos",
  state: "doing",
  priority: "high",
  is_now: true,
  done_at: null,
  updated_at: "2026-10-27T10:00:00Z",
};

const { listDemands, toDemand } = await import("./demands");

test("converte a linha do banco para o formato das telas", () => {
  expect(toDemand(row)).toEqual({
    id: "t1",
    projectId: "p1",
    title: "Revisar textos",
    state: "Fazendo",
    priority: "Alta",
    isNow: true,
    lastActivityAt: "2026-10-27T10:00:00Z",
    subtasks: [],
    comments: [],
    attachments: [],
    history: [],
  });
  expect(
    toDemand({
      ...row,
      state: "done",
      priority: "low",
      is_now: false,
      done_at: "2026-10-27T11:00:00Z",
    }),
  ).toMatchObject({
    state: "Feito",
    priority: "Baixa",
    isNow: false,
    doneAt: "2026-10-27T11:00:00Z",
  });
  expect(toDemand({ ...row, state: "todo", priority: "medium" })).toMatchObject(
    {
      state: "A fazer",
      priority: "Média",
    },
  );
});

test("lê só demandas ativas e de primeiro nível", async () => {
  await expect(listDemands()).resolves.toHaveLength(1);
  expect(db.calls).toEqual([
    "tasks.is(archived_at)",
    "tasks.is(parent_task_id)",
  ]);
});

test("erro do banco não vira lista vazia", async () => {
  db.error = { message: "falhou" };
  await expect(listDemands()).rejects.toEqual({ message: "falhou" });
});
