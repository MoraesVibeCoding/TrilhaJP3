import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

// Cada ação fica pendente até o teste decidir se gravou: dá para ver a mudança otimista no meio.
// O React junta as transições: uma que ficou pendente segura as dos testes seguintes.
const pending: ((ok: boolean) => void)[] = [];
const wait = () => new Promise<boolean>((resolve) => pending.push(resolve));
const actions = vi.hoisted(() => ({
  moveDemand: vi.fn(),
  concludeStep: vi.fn(),
  setNow: vi.fn(),
  addSubtask: vi.fn(),
  renameSubtask: vi.fn(),
  toggleSubtask: vi.fn(),
  archiveSubtask: vi.fn(),
}));
vi.mock("@/app/(app)/demandas/actions", () => actions);

afterEach(() => settle(true));

const { useDemandState } = await import("./use-demand-state");

type Demand = {
  id: string;
  state: string;
  lastActivityAt: string;
  doneAt?: string;
  subtasks: readonly { id: string; title: string; done: boolean }[];
  isNow: boolean;
};
const demands: readonly Demand[] = [
  {
    id: "a",
    state: "Fazendo",
    lastActivityAt: "2026-10-20T10:00:00",
    subtasks: [
      { id: "Um", title: "Um", done: true },
      { id: "Dois", title: "Dois", done: false },
    ],
    isNow: true,
  },
  {
    id: "b",
    state: "Feito",
    lastActivityAt: "2026-10-19T10:00:00",
    doneAt: "2026-10-19T10:00:00",
    subtasks: [],
    isNow: false,
  },
];

const setup = () => renderHook(() => useDemandState(demands));
const get = (r: ReturnType<typeof setup>, id: string) =>
  r.result.current.current.find((d) => d.id === id)!;
const settle = (ok: boolean) =>
  act(async () => {
    pending.splice(0).forEach((resolve) => resolve(ok));
    await new Promise((r) => setTimeout(r, 0));
  });

beforeEach(() => {
  for (const action of Object.values(actions))
    action.mockReset().mockImplementation(wait);
});

test("moveTo shows the new state at once and saves it with the database value", async () => {
  const r = setup();
  act(() => r.result.current.moveTo("a", "Feito"));
  expect(get(r, "a").state).toBe("Feito");
  expect(get(r, "a").doneAt).toBeDefined();
  expect(get(r, "a").lastActivityAt).not.toBe("2026-10-20T10:00:00");
  expect(actions.moveDemand).toHaveBeenCalledWith("a", "done");
  await settle(true);
  expect(r.result.current.failure).toBe("");
});

test("leaving Feito clears doneAt", () => {
  const r = setup();
  act(() => r.result.current.moveTo("b", "A fazer"));
  expect(get(r, "b").doneAt).toBeUndefined();
  expect(actions.moveDemand).toHaveBeenCalledWith("b", "todo");
});

test("moving to the same state, or an unknown id, saves nothing", () => {
  const r = setup();
  act(() => r.result.current.moveTo("a", "Fazendo"));
  act(() => r.result.current.moveTo("zzz", "Feito"));
  expect(actions.moveDemand).not.toHaveBeenCalled();
});

test("a failed save goes back to the data and says so", async () => {
  const r = setup();
  act(() => r.result.current.moveTo("a", "A fazer"));
  await settle(false);
  expect(get(r, "a").state).toBe("Fazendo");
  expect(r.result.current.failure).toBe(
    "Não foi possível salvar. Tente de novo.",
  );
});

test("conclude marks the first open step and saves it", () => {
  const r = setup();
  act(() => r.result.current.conclude("a"));
  expect(get(r, "a").subtasks.map((s) => s.done)).toEqual([true, true]);
  expect(actions.concludeStep).toHaveBeenCalledWith("a");
});

test("conclude with no open step saves nothing", () => {
  const r = setup();
  act(() => r.result.current.conclude("b"));
  act(() => r.result.current.conclude("zzz"));
  expect(actions.concludeStep).not.toHaveBeenCalled();
});

test("marking another demand as Agora unmarks the previous one", () => {
  const r = setup();
  act(() => r.result.current.toggleNow("b"));
  expect(get(r, "b").isNow).toBe(true);
  expect(get(r, "a").isNow).toBe(false);
  expect(actions.setNow).toHaveBeenCalledWith("b", true);
});

test("toggling the marked demand takes it out of Agora", () => {
  const r = setup();
  act(() => r.result.current.toggleNow("a"));
  expect(get(r, "a").isNow).toBe(false);
  expect(actions.setNow).toHaveBeenCalledWith("a", false);
});

// T7: passos editáveis, com a mesma mudança otimista e a mesma volta quando não grava.
test("steps.add puts the new step at the end at once and saves it", () => {
  const r = setup();
  act(() => r.result.current.steps("a").add("Três"));
  expect(get(r, "a").subtasks.map((s) => s.title)).toEqual([
    "Um",
    "Dois",
    "Três",
  ]);
  expect(get(r, "a").subtasks[2].done).toBe(false);
  expect(actions.addSubtask).toHaveBeenCalledWith("a", "Três");
});

test("steps.rename, toggle and remove change only that step and save it", () => {
  const r = setup();
  act(() => r.result.current.steps("a").rename("Dois", "Dois e meio"));
  act(() => r.result.current.steps("a").toggle("Um", false));
  act(() => r.result.current.steps("a").remove("Dois"));
  expect(get(r, "a").subtasks).toEqual([
    { id: "Um", title: "Um", done: false },
  ]);
  expect(actions.renameSubtask).toHaveBeenCalledWith("Dois", "Dois e meio");
  expect(actions.toggleSubtask).toHaveBeenCalledWith("Um", false);
  expect(actions.archiveSubtask).toHaveBeenCalledWith("Dois");
});

test("a step that fails to save goes back and says so", async () => {
  const r = setup();
  act(() => r.result.current.steps("a").remove("Um"));
  await settle(false);
  expect(get(r, "a").subtasks).toHaveLength(2);
  expect(r.result.current.failure).toBe(
    "Não foi possível salvar. Tente de novo.",
  );
});
