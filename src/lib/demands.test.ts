import { expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  error: null as object | null,
  calls: [] as string[],
  rows: [] as object[],
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
          data: db.error ? null : db.rows,
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
  parent_task_id: null,
  created_at: "2026-10-20T10:00:00Z",
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

const step = (title: string, state: string, created_at: string) => ({
  ...row,
  id: title,
  title,
  state,
  is_now: false,
  parent_task_id: "t1",
  created_at,
});

test("lê só demandas ativas; as filhas viram subtarefas, na ordem de criação", async () => {
  db.rows = [
    step("Rodapé", "todo", "2026-10-22T10:00:00Z"),
    row,
    step("Home", "done", "2026-10-20T10:00:00Z"),
    step("Contato", "doing", "2026-10-21T10:00:00Z"),
  ];
  const demands = await listDemands();
  expect(db.calls).toEqual(["tasks.is(archived_at)"]);
  expect(demands.map((d) => d.id)).toEqual(["t1"]);
  expect(demands[0].subtasks).toEqual([
    { title: "Home", done: true },
    { title: "Contato", done: false },
    { title: "Rodapé", done: false },
  ]);
});

test("erro do banco não vira lista vazia", async () => {
  db.error = { message: "falhou" };
  await expect(listDemands()).rejects.toEqual({ message: "falhou" });
});
