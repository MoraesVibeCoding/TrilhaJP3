import { expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  error: null as object | null,
  calls: [] as string[],
  // T9: os filtros da consulta de comentários ficam à parte dos da de demandas
  commentCalls: [] as string[],
  rows: [] as object[],
  // T8: etiquetas aplicadas e etiquetas da empresa
  taskLabels: [] as object[],
  labels: [] as object[],
  // T9: comentários ativos
  comments: [] as object[],
  // T10: eventos do histórico e a ordem pedida a cada tabela
  events: [] as object[],
  // T11: anexos
  attachments: [] as object[],
  orders: [] as string[],
}));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => ({ id: "u1" }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const result = () => ({
        data: db.error
          ? null
          : {
              tasks: db.rows,
              task_labels: db.taskLabels,
              labels: db.labels,
              task_comments: db.comments,
              task_events: db.events,
              attachments: db.attachments,
            }[table],
        error: db.error,
      });
      const chain = {
        select: () => chain,
        is: (column: string) => {
          (table === "task_comments" ? db.commentCalls : db.calls).push(
            `${table}.is(${column})`,
          );
          return chain;
        },
        order: async (column: string, options?: { ascending?: boolean }) => {
          db.orders.push(`${table}.${column} ${options?.ascending ?? true}`);
          return result();
        },
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

const { listDemands, listLabels, toDemand } = await import("./demands");

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

test("listLabels reads the company labels, and a database error is not an empty list", async () => {
  db.error = null;
  db.labels = [{ id: "l1", name: "Bug", color: "tijolo" }];
  await expect(listLabels()).resolves.toEqual(db.labels);
  db.error = { message: "falhou" };
  await expect(listLabels()).rejects.toEqual({ message: "falhou" });
  db.error = null;
  db.labels = [];
});

test("cada demanda traz os comentários ativos em ordem de criação, marcando os de quem está logado", async () => {
  db.error = null;
  db.calls = [];
  db.commentCalls = [];
  db.rows = [row];
  db.comments = [
    {
      id: "c2",
      task_id: "t1",
      body: "Segundo",
      author_name: "ana",
      created_by: "u2",
      created_at: "2026-11-02T10:00:00Z",
    },
    {
      id: "c1",
      task_id: "t1",
      body: "Primeiro",
      author_name: "pedro",
      created_by: "u1",
      created_at: "2026-11-01T10:00:00Z",
    },
    {
      id: "c3",
      task_id: "outra",
      body: "De outra",
      author_name: "pedro",
      created_by: "u1",
      created_at: "2026-11-01T09:00:00Z",
    },
  ];
  const [demand] = await listDemands();
  expect(db.commentCalls).toEqual(["task_comments.is(archived_at)"]);
  expect(demand.comments).toEqual([
    {
      id: "c1",
      author: "pedro",
      at: "2026-11-01T10:00:00Z",
      text: "Primeiro",
      mine: true,
    },
    {
      id: "c2",
      author: "ana",
      at: "2026-11-02T10:00:00Z",
      text: "Segundo",
      mine: false,
    },
  ]);
  db.comments = [];
});

test("cada demanda traz os 50 eventos mais recentes, com o texto, o autor e mine", async () => {
  db.error = null;
  db.rows = [row];
  db.orders = [];
  // O banco devolve do mais novo ao mais antigo (id desc); 52 eventos, 2 a mais que o limite.
  db.events = [
    {
      id: 52,
      task_id: "t1",
      type: "field_changed",
      changes: { field: "state", from: "todo", to: "doing" },
      actor_id: "u1",
      actor_name: "pedro",
      created_at: "2026-11-04T15:00:00Z",
    },
    {
      id: 51,
      task_id: "outra",
      type: "task_created",
      changes: {},
      actor_id: "u1",
      actor_name: "pedro",
      created_at: "2026-11-04T14:00:00Z",
    },
    ...Array.from({ length: 51 }, (_, i) => ({
      id: 50 - i,
      task_id: "t1",
      type: "label_applied",
      changes: { name: `E${i}` },
      actor_id: null,
      actor_name: "Sistema",
      created_at: "2026-11-03T10:00:00Z",
    })),
  ];
  const [demand] = await listDemands();
  expect(db.orders).toContain("task_events.id false");
  expect(demand.history).toHaveLength(50);
  expect(demand.history[0]).toEqual({
    id: 52,
    at: "2026-11-04T15:00:00Z",
    author: "pedro",
    text: "Estado: A fazer → Fazendo",
    mine: true,
  });
  expect(demand.history[1]).toEqual({
    id: 50,
    at: "2026-11-03T10:00:00Z",
    author: "Sistema",
    text: "Aplicou a etiqueta E0",
    mine: false,
  });
  db.events = [];
});

test("cada demanda traz os anexos, do mais novo ao mais antigo, com tipo, tamanho, autor e mine", async () => {
  db.error = null;
  db.rows = [row];
  db.orders = [];
  db.attachments = [
    {
      id: "a2",
      task_id: "t1",
      file_name: "print.png",
      mime_type: "image/png",
      size_bytes: 2048,
      uploaded_by: "u2",
      uploader_name: "ana",
      created_at: "2026-11-11T15:00:00Z",
    },
    {
      id: "a1",
      task_id: "t1",
      file_name: "contrato.pdf",
      mime_type: "application/pdf",
      size_bytes: 4096,
      uploaded_by: "u1",
      uploader_name: "pedro",
      created_at: "2026-11-10T09:00:00Z",
    },
    {
      id: "a3",
      task_id: "outra",
      file_name: "de-outra.pdf",
      mime_type: "application/pdf",
      size_bytes: 1,
      uploaded_by: "u1",
      uploader_name: "pedro",
      created_at: "2026-11-11T16:00:00Z",
    },
  ];
  const [demand] = await listDemands();
  expect(db.orders).toContain("attachments.created_at false");
  expect(demand.attachments).toEqual([
    {
      id: "a2",
      name: "print.png",
      mime: "image/png",
      size: 2048,
      author: "ana",
      at: "2026-11-11T15:00:00Z",
      mine: false,
    },
    {
      id: "a1",
      name: "contrato.pdf",
      mime: "application/pdf",
      size: 4096,
      author: "pedro",
      at: "2026-11-10T09:00:00Z",
      mine: true,
    },
  ]);
  db.attachments = [];
});
