import { expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  error: null as object | null,
  calls: [] as string[],
  rows: [] as object[],
  // T8: etiquetas aplicadas e etiquetas da empresa
  taskLabels: [] as object[],
  labels: [] as object[],
}));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const result = () => ({
        data: db.error
          ? null
          : { tasks: db.rows, task_labels: db.taskLabels, labels: db.labels }[
              table
            ],
        error: db.error,
      });
      const chain = {
        select: () => chain,
        is: (column: string) => {
          db.calls.push(`${table}.is(${column})`);
          return chain;
        },
        order: async () => result(),
        then: (resolve: (v: unknown) => void) => resolve(result()),
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
  description: null,
  due_date: null,
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
    labels: [],
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

test("descrição e prazo só entram quando existem", () => {
  expect(toDemand(row)).not.toHaveProperty("description");
  expect(toDemand(row)).not.toHaveProperty("dueDate");
  expect(
    toDemand({ ...row, description: "Com o cliente.", due_date: "2026-10-30" }),
  ).toMatchObject({ description: "Com o cliente.", dueDate: "2026-10-30" });
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
    { id: "Home", title: "Home", done: true },
    { id: "Contato", title: "Contato", done: false },
    { id: "Rodapé", title: "Rodapé", done: false },
  ]);
});

test("erro do banco não vira lista vazia", async () => {
  db.error = { message: "falhou" };
  await expect(listDemands()).rejects.toEqual({ message: "falhou" });
});

test("cada demanda traz as etiquetas aplicadas, em ordem de nome", async () => {
  db.error = null;
  db.rows = [row, { ...row, id: "t2" }];
  db.labels = [
    { id: "l1", name: "Financeiro", color: "mostarda" },
    { id: "l2", name: "Bug", color: "tijolo" },
  ];
  db.taskLabels = [
    { task_id: "t1", label_id: "l1" },
    { task_id: "t1", label_id: "l2" },
  ];
  const demands = await listDemands();
  expect(demands.find((d) => d.id === "t1")!.labels).toEqual([
    { id: "l2", name: "Bug", color: "tijolo" },
    { id: "l1", name: "Financeiro", color: "mostarda" },
  ]);
  expect(demands.find((d) => d.id === "t2")!.labels).toEqual([]);
  db.labels = [];
  db.taskLabels = [];
});
