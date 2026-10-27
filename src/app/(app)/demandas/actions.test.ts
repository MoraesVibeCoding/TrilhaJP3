import { beforeEach, describe, expect, test, vi } from "vitest";

// Cada consulta grava a cadeia de chamadas e devolve o próximo resultado da fila.
const db = vi.hoisted(() => ({
  queries: [] as string[][],
  results: [] as { data?: unknown; error?: object | null }[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () => ({ id: "u1", organizationId: "org-1" }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const calls = [`from(${table})`];
      db.queries.push(calls);
      const chain: object = new Proxy(
        {},
        {
          get: (_target, method: string) =>
            method === "then"
              ? (resolve: (v: unknown) => void) =>
                  resolve({ data: null, error: null, ...db.results.shift() })
              : (...args: unknown[]) => {
                  calls.push(
                    `${method}(${args.map((a) => JSON.stringify(a)).join(",")})`,
                  );
                  return chain;
                },
        },
      );
      return chain;
    },
  }),
}));

const { moveDemand, concludeStep, setNow } = await import("./actions");
const { revalidatePath } = await import("next/cache");

const ID = "7d3c6a8e-1f2b-4c5d-9e0f-112233445566";
const STEP = "11111111-2222-4333-8444-555555555555";

beforeEach(() => {
  db.queries = [];
  db.results = [];
  vi.mocked(revalidatePath).mockClear();
});

describe("moveDemand", () => {
  test("grava o estado e atualiza as telas", async () => {
    db.results = [{ data: [{ id: ID }] }];
    await expect(moveDemand(ID, "done")).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"state":"done"})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("recusa estado ou id inválidos sem tocar no banco", async () => {
    await expect(moveDemand(ID, "blocked")).resolves.toBe(false);
    await expect(moveDemand("d1", "done")).resolves.toBe(false);
    expect(db.queries).toEqual([]);
  });

  test("nenhuma linha (outra empresa) ou erro do banco = falhou", async () => {
    db.results = [{ data: [] }, { error: { message: "x" } }];
    await expect(moveDemand(ID, "doing")).resolves.toBe(false);
    await expect(moveDemand(ID, "doing")).resolves.toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("concludeStep", () => {
  test("conclui a primeira subtarefa aberta, na ordem de criação", async () => {
    db.results = [{ data: [{ id: STEP }] }, { data: [{ id: STEP }] }];
    await expect(concludeStep(ID)).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `select("id")`,
        `eq("parent_task_id","${ID}")`,
        `neq("state","done")`,
        `is("archived_at",null)`,
        `order("created_at")`,
        "limit(1)",
      ],
      [
        "from(tasks)",
        `update({"state":"done"})`,
        `eq("id","${STEP}")`,
        `select("id")`,
      ],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test("sem passo aberto, nada muda", async () => {
    db.results = [{ data: [] }];
    await expect(concludeStep(ID)).resolves.toBe(false);
    expect(db.queries).toHaveLength(1);
  });
});

describe("setNow", () => {
  test("marcar tira a Agora anterior da empresa antes de marcar esta", async () => {
    db.results = [{}, { data: [{ id: ID }] }];
    await expect(setNow(ID, true)).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"is_now":false})`,
        `eq("organization_id","org-1")`,
        `eq("is_now",true)`,
        `neq("id","${ID}")`,
      ],
      [
        "from(tasks)",
        `update({"is_now":true})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
  });

  test("desmarcar só mexe nesta", async () => {
    db.results = [{ data: [{ id: ID }] }];
    await expect(setNow(ID, false)).resolves.toBe(true);
    expect(db.queries).toEqual([
      [
        "from(tasks)",
        `update({"is_now":false})`,
        `eq("id","${ID}")`,
        `select("id")`,
      ],
    ]);
  });

  test("falha ao tirar a anterior não marca a nova", async () => {
    db.results = [{ error: { message: "x" } }];
    await expect(setNow(ID, true)).resolves.toBe(false);
    expect(db.queries).toHaveLength(1);
  });
});
